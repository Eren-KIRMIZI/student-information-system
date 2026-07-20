import ExcelJS from 'exceljs';
import prisma from '../config/prisma.js';
import { tracer } from '../utils/tracer.js';

// ==================== STYLE HELPERS ====================

const HEADER_FILL = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF1E3A5F' },
};

const HEADER_FONT = {
  bold: true,
  color: { argb: 'FFFFFFFF' },
  size: 11,
  name: 'Calibri',
};

const applyHeaderStyle = (row) => {
  row.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      bottom: { style: 'medium', color: { argb: 'FF4472C4' } },
    };
  });
  row.height = 28;
};

const applyDataRow = (row, index) => {
  if (index % 2 === 0) {
    row.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F4FA' } };
    });
  }
  row.eachCell((cell) => {
    cell.alignment = { vertical: 'middle' };
  });
};

const autoWidth = (sheet) => {
  sheet.columns.forEach((col) => {
    let maxLen = (col.header || '').length;
    col.eachCell({ includeEmpty: true }, (cell) => {
      const len = cell.value ? String(cell.value).length : 0;
      if (len > maxLen) maxLen = len;
    });
    col.width = Math.min(maxLen + 4, 50);
  });
};

// ==================== STUDENTS EXPORT ====================

export async function exportStudents(res) {
  const span = tracer.startSpan('ExportService.exportStudents');

  const students = await prisma.student.findMany({
    include: {
      department: { include: { faculty: true } },
      user: { select: { email: true, isActive: true, lastLoginAt: true } },
    },
    orderBy: [{ department: { code: 'asc' } }, { studentNumber: 'asc' }],
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'OBS Sistema';
  workbook.created = new Date();
  workbook.properties.date1904 = false;

  const sheet = workbook.addWorksheet('Öğrenciler', {
    views: [{ state: 'frozen', ySplit: 1 }],
    pageSetup: { orientation: 'landscape', paperSize: 9 },
  });

  sheet.columns = [
    { header: 'Öğrenci No',    key: 'studentNumber', width: 14 },
    { header: 'Ad',            key: 'firstName',     width: 15 },
    { header: 'Soyad',         key: 'lastName',      width: 15 },
    { header: 'TC No',         key: 'nationalId',    width: 14 },
    { header: 'Email',         key: 'email',         width: 30 },
    { header: 'Telefon',       key: 'phone',         width: 14 },
    { header: 'Fakülte',       key: 'faculty',       width: 30 },
    { header: 'Bölüm',         key: 'department',    width: 28 },
    { header: 'Sınıf',         key: 'classYear',     width: 8 },
    { header: 'GPA',           key: 'gpa',           width: 8 },
    { header: 'Toplam Kredi',  key: 'totalCredits',  width: 14 },
    { header: 'Doğum Tarihi',  key: 'birthDate',     width: 14 },
    { header: 'Durum',         key: 'isActive',      width: 10 },
    { header: 'Son Giriş',     key: 'lastLoginAt',   width: 20 },
  ];

  applyHeaderStyle(sheet.getRow(1));

  students.forEach((s, i) => {
    const row = sheet.addRow({
      studentNumber: s.studentNumber,
      firstName:     s.firstName,
      lastName:      s.lastName,
      nationalId:    s.nationalId,
      email:         s.user.email,
      phone:         s.phone || '-',
      faculty:       s.department?.faculty?.name || '-',
      department:    s.department?.name || '-',
      classYear:     s.classYear,
      gpa:           s.gpa ?? '-',
      totalCredits:  s.totalCredits ?? '-',
      birthDate:     s.birthDate ? new Date(s.birthDate).toLocaleDateString('tr-TR') : '-',
      isActive:      s.user.isActive ? 'Aktif' : 'Pasif',
      lastLoginAt:   s.user.lastLoginAt ? new Date(s.user.lastLoginAt).toLocaleString('tr-TR') : '-',
    });
    applyDataRow(row, i);
  });

  // Özet satırı
  const totalRow = sheet.addRow({
    studentNumber: `Toplam: ${students.length} öğrenci`,
  });
  totalRow.getCell(1).font = { bold: true, color: { argb: 'FF1E3A5F' } };

  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 14 } };

  span.end({ studentCount: students.length });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="ogrenciler-${new Date().toISOString().slice(0, 10)}.xlsx"`);

  await workbook.xlsx.write(res);
}

// ==================== GRADES EXPORT ====================

export async function exportGrades(res, filters = {}) {
  const span = tracer.startSpan('ExportService.exportGrades');

  const where = {};
  if (filters.academicYear) where.enrollment = { academicYear: filters.academicYear };

  const grades = await prisma.grade.findMany({
    where,
    include: {
      enrollment: {
        include: {
          student: { select: { studentNumber: true, firstName: true, lastName: true } },
          course:  { select: { code: true, name: true, credits: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50000,
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'OBS Sistema';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Notlar', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  sheet.columns = [
    { header: 'Öğrenci No',   key: 'studentNumber', width: 14 },
    { header: 'Ad',           key: 'firstName',     width: 15 },
    { header: 'Soyad',        key: 'lastName',      width: 15 },
    { header: 'Ders Kodu',    key: 'courseCode',    width: 12 },
    { header: 'Ders Adı',     key: 'courseName',    width: 30 },
    { header: 'Kredi',        key: 'credits',       width: 8 },
    { header: 'Dönem',        key: 'semester',      width: 10 },
    { header: 'Akademik Yıl', key: 'academicYear',  width: 12 },
    { header: 'Vize',         key: 'midterm',       width: 8 },
    { header: 'Final',        key: 'final',         width: 8 },
    { header: 'Ortalama',     key: 'average',       width: 10 },
    { header: 'Harf Notu',    key: 'letterGrade',   width: 10 },
    { header: 'GPA Puanı',    key: 'gpaPoints',     width: 10 },
  ];

  applyHeaderStyle(sheet.getRow(1));

  grades.forEach((g, i) => {
    const row = sheet.addRow({
      studentNumber: g.enrollment.student.studentNumber,
      firstName:     g.enrollment.student.firstName,
      lastName:      g.enrollment.student.lastName,
      courseCode:    g.enrollment.course.code,
      courseName:    g.enrollment.course.name,
      credits:       g.enrollment.course.credits,
      semester:      g.enrollment.semester === 'FALL' ? 'Güz' : 'Bahar',
      academicYear:  g.enrollment.academicYear,
      midterm:       g.midterm ?? '-',
      final:         g.final ?? '-',
      average:       g.average ?? '-',
      letterGrade:   g.letterGrade ?? '-',
      gpaPoints:     g.gpaPoints ?? '-',
    });
    applyDataRow(row, i);
  });

  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 13 } };

  span.end({ gradeCount: grades.length });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="notlar-${new Date().toISOString().slice(0, 10)}.xlsx"`);

  await workbook.xlsx.write(res);
}

// ==================== ATTENDANCE EXPORT ====================

export async function exportAttendance(res, filters = {}) {
  const span = tracer.startSpan('ExportService.exportAttendance');

  const attendance = await prisma.attendance.findMany({
    include: {
      student: { select: { studentNumber: true, firstName: true, lastName: true } },
      courseSection: {
        include: { course: { select: { code: true, name: true } } },
      },
    },
    orderBy: { date: 'desc' },
    take: 100000,
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Devamsızlık', { views: [{ state: 'frozen', ySplit: 1 }] });

  sheet.columns = [
    { header: 'Öğrenci No',  key: 'studentNumber', width: 14 },
    { header: 'Ad',          key: 'firstName',     width: 15 },
    { header: 'Soyad',       key: 'lastName',      width: 15 },
    { header: 'Ders Kodu',   key: 'courseCode',    width: 12 },
    { header: 'Ders Adı',    key: 'courseName',    width: 30 },
    { header: 'Tarih',       key: 'date',          width: 14 },
    { header: 'Durum',       key: 'status',        width: 12 },
    { header: 'Hafta',       key: 'week',          width: 8 },
  ];

  applyHeaderStyle(sheet.getRow(1));

  const statusMap = { PRESENT: 'Katıldı', ABSENT: 'Katılmadı', EXCUSED: 'Mazeretli' };

  attendance.forEach((a, i) => {
    const row = sheet.addRow({
      studentNumber: a.student.studentNumber,
      firstName:     a.student.firstName,
      lastName:      a.student.lastName,
      courseCode:    a.courseSection?.course?.code || '-',
      courseName:    a.courseSection?.course?.name || '-',
      date:          new Date(a.date).toLocaleDateString('tr-TR'),
      status:        statusMap[a.status] || a.status,
      week:          a.week ?? '-',
    });
    applyDataRow(row, i);
  });

  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 8 } };
  span.end({ attendanceCount: attendance.length });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="devamsizlik-${new Date().toISOString().slice(0, 10)}.xlsx"`);

  await workbook.xlsx.write(res);
}

// ==================== TRANSCRIPT EXPORT ====================

export async function exportTranscript(res, studentId) {
  const span = tracer.startSpan('ExportService.exportTranscript', { studentId });

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      department: { include: { faculty: true } },
      user: { select: { email: true } },
      enrollments: {
        where: { status: 'COMPLETED' },
        include: {
          course: { select: { code: true, name: true, credits: true, ects: true } },
          grade: true,
        },
        orderBy: [{ academicYear: 'asc' }, { semester: 'asc' }],
      },
    },
  });

  if (!student) throw new Error('Öğrenci bulunamadı');

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Transkript', { views: [{ state: 'frozen', ySplit: 6 }] });

  // ---- HEADER SECTION ----
  sheet.mergeCells('A1:G1');
  sheet.getCell('A1').value = 'BOZOK ÜNİVERSİTESİ — RESMİ TRANSKRİPT';
  sheet.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FF1E3A5F' } };
  sheet.getCell('A1').alignment = { horizontal: 'center' };

  sheet.mergeCells('A2:G2');
  sheet.getCell('A2').value = student.department?.faculty?.name || '-';
  sheet.getCell('A2').alignment = { horizontal: 'center' };

  sheet.getCell('A3').value = 'Öğrenci Adı:';    sheet.getCell('B3').value = `${student.firstName} ${student.lastName}`;
  sheet.getCell('A4').value = 'Öğrenci No:';     sheet.getCell('B4').value = student.studentNumber;
  sheet.getCell('A5').value = 'Bölüm:';          sheet.getCell('B5').value = student.department?.name || '-';
  sheet.getCell('D3').value = 'GPA:';             sheet.getCell('E3').value = student.gpa ?? '-';
  sheet.getCell('D4').value = 'Toplam Kredi:';   sheet.getCell('E4').value = student.totalCredits ?? '-';
  sheet.getCell('D5').value = 'Tarih:';           sheet.getCell('E5').value = new Date().toLocaleDateString('tr-TR');

  [3, 4, 5].forEach((r) => {
    sheet.getCell(`A${r}`).font = { bold: true };
    sheet.getCell(`D${r}`).font = { bold: true };
  });

  // ---- DATA TABLE ----
  const headerRow = sheet.getRow(7);
  headerRow.values = ['Dönem', 'Akademik Yıl', 'Ders Kodu', 'Ders Adı', 'Kredi', 'AKTS', 'Harf Notu', 'GPA Puanı'];
  applyHeaderStyle(headerRow);
  sheet.getRow(6).height = 10;

  student.enrollments.forEach((en, i) => {
    const row = sheet.addRow([
      en.semester === 'FALL' ? 'Güz' : 'Bahar',
      en.academicYear,
      en.course.code,
      en.course.name,
      en.course.credits,
      en.course.ects,
      en.grade?.letterGrade || '-',
      en.grade?.gpaPoints ?? '-',
    ]);
    applyDataRow(row, i);
  });

  // GPA summary
  sheet.addRow([]);
  const summaryRow = sheet.addRow(['', '', '', 'GPA (Ağırlıklı Ortalama)', '', '', '', student.gpa ?? '-']);
  summaryRow.font = { bold: true };

  sheet.columns = [
    { width: 10 }, { width: 14 }, { width: 12 }, { width: 35 },
    { width: 8 }, { width: 8 }, { width: 12 }, { width: 12 },
  ];

  span.end({ enrollmentCount: student.enrollments.length });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="transkript-${student.studentNumber}.xlsx"`);

  await workbook.xlsx.write(res);
}
