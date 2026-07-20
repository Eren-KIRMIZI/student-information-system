import { parse } from 'csv-parse';
import { Readable } from 'stream';
import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';
import { tracer } from '../utils/tracer.js';
import { logger } from '../utils/winstonLogger.js';

/**
 * CSV formatı:
 * studentNumber,firstName,lastName,nationalId,email,phone,birthDate,classYear,departmentCode
 *
 * Örnek:
 * 2024000001,Ahmet,Yılmaz,12345678901,ahmet@ogrenci.obs.edu.tr,5551234567,2000-05-15,1,CS
 */

const REQUIRED_COLUMNS = [
  'studentNumber', 'firstName', 'lastName', 'nationalId',
  'email', 'departmentCode',
];

export async function importStudentsFromCSV(buffer, roleId) {
  const span = tracer.startSpan('ImportService.importStudentsFromCSV');

  const results = {
    total:    0,
    imported: 0,
    skipped:  0,
    errors:   [],
  };

  // Parse CSV
  let records;
  try {
    records = await parseCSV(buffer);
  } catch (err) {
    throw new Error(`CSV parse hatası: ${err.message}`);
  }

  results.total = records.length;

  if (results.total === 0) {
    throw new Error('CSV dosyası boş veya geçersiz format');
  }

  // Validate columns
  const firstRow = records[0];
  const missingCols = REQUIRED_COLUMNS.filter((c) => !(c in firstRow));
  if (missingCols.length > 0) {
    throw new Error(`Eksik sütunlar: ${missingCols.join(', ')}`);
  }

  // Fetch all departments for lookup
  const departments = await prisma.department.findMany({ select: { id: true, code: true } });
  const deptMap = Object.fromEntries(departments.map((d) => [d.code, d.id]));

  const defaultPassword = await bcrypt.hash('Student123!', 10);

  // Process each row
  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    const rowNum = i + 2; // 1-indexed + header row

    try {
      // Validate required fields
      const missing = REQUIRED_COLUMNS.filter((c) => !row[c]?.trim());
      if (missing.length > 0) {
        results.errors.push({ row: rowNum, error: `Eksik alanlar: ${missing.join(', ')}`, data: row });
        results.skipped++;
        continue;
      }

      const deptId = deptMap[row.departmentCode?.trim()];
      if (!deptId) {
        results.errors.push({ row: rowNum, error: `Bölüm kodu bulunamadı: ${row.departmentCode}`, data: row });
        results.skipped++;
        continue;
      }

      // Validate nationalId (11 hane)
      const nationalId = row.nationalId?.trim();
      if (!/^\d{11}$/.test(nationalId)) {
        results.errors.push({ row: rowNum, error: 'Geçersiz TC kimlik numarası (11 hane olmalı)', data: row });
        results.skipped++;
        continue;
      }

      const email = row.email?.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        results.errors.push({ row: rowNum, error: 'Geçersiz email adresi', data: row });
        results.skipped++;
        continue;
      }

      // Find studentRole
      const studentRole = await prisma.role.findFirst({ where: { name: 'STUDENT' } });
      if (!studentRole) throw new Error('STUDENT rolü bulunamadı');

      // Create user + student in transaction
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            password: defaultPassword,
            roleId: studentRole.id,
          },
        });

        await tx.student.create({
          data: {
            userId: user.id,
            studentNumber: row.studentNumber?.trim(),
            nationalId,
            firstName: row.firstName?.trim(),
            lastName:  row.lastName?.trim(),
            phone:     row.phone?.trim() || null,
            birthDate: row.birthDate ? new Date(row.birthDate) : null,
            classYear: parseInt(row.classYear) || 1,
            departmentId: deptId,
          },
        });
      });

      results.imported++;
    } catch (err) {
      const isDuplicate = err.code === 'P2002';
      const errorMsg = isDuplicate
        ? `Zaten kayıtlı: ${err.meta?.target?.join(', ')}`
        : err.message;

      results.errors.push({ row: rowNum, error: errorMsg, data: row });
      results.skipped++;
    }

    // Log progress every 50 rows
    if ((i + 1) % 50 === 0) {
      logger.info(`[Import] ${i + 1}/${records.length} satır işlendi`, {
        imported: results.imported,
        skipped: results.skipped,
      });
    }
  }

  span.end({
    total:    results.total,
    imported: results.imported,
    skipped:  results.skipped,
  });

  return results;
}

// ==================== HELPERS ====================

function parseCSV(buffer) {
  return new Promise((resolve, reject) => {
    const rows = [];
    const stream = Readable.from(buffer.toString('utf-8'));

    stream
      .pipe(
        parse({
          columns:          true,
          skip_empty_lines: true,
          trim:             true,
          bom:              true,
        })
      )
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}
