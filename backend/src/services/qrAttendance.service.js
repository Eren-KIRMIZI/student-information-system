import crypto from 'crypto';
import * as repo from '../repositories/qrToken.repository.js';
import { AppError } from '../utils/appError.util.js';
import prisma from '../config/prisma.js';
import { getIO } from '../config/socket.js';

const TOKEN_EXPIRY_MINUTES = 5;

export const generateQRToken = async (userId, courseSectionId) => {
  const lecturer = await prisma.lecturer.findUnique({ where: { userId }, select: { id: true } });
  if (!lecturer) throw new AppError('Akademisyen profili bulunamadı', 404);

  const section = await prisma.courseSection.findUnique({ where: { id: courseSectionId }, include: { course: true } });
  if (!section) throw new AppError('Ders şubesi bulunamadı', 404);
  if (section.lecturerId !== lecturer.id) throw new AppError('Bu şubeye QR oluşturma yetkiniz yok', 403);

  const existing = await repo.qrTokenFindActive(courseSectionId);
  if (existing) throw new AppError('Bu ders için aktif bir QR kodu zaten mevcut', 409);

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);

  return repo.qrTokenCreate({ token, courseSectionId, expiresAt, createdBy: lecturer.id });
};

export const getQRToken = async (userId, courseSectionId) => {
  const lecturer = await prisma.lecturer.findUnique({ where: { userId }, select: { id: true } });
  if (!lecturer) throw new AppError('Akademisyen profili bulunamadı', 404);

  const section = await prisma.courseSection.findUnique({ where: { id: courseSectionId } });
  if (!section || section.lecturerId !== lecturer.id) throw new AppError('Yetkiniz yok', 403);

  const existing = await repo.qrTokenFindActive(courseSectionId);
  if (!existing) throw new AppError('Aktif QR kodu bulunamadı. Yeni bir QR kodu oluşturun.', 404);

  return { token: existing.token, expiresAt: existing.expiresAt };
};

export const scanQRToken = async (userId, token) => {
  const student = await prisma.student.findUnique({ where: { userId }, select: { id: true } });
  if (!student) throw new AppError('Öğrenci profili bulunamadı', 404);

  const qrToken = await repo.qrTokenFindByToken(token);
  if (!qrToken) throw new AppError('Geçersiz QR kodu', 404);
  if (!qrToken.isActive) throw new AppError('QR kodu artık aktif değil', 400);
  if (new Date() > qrToken.expiresAt) {
    await repo.qrTokenDeactivate(qrToken.id);
    throw new AppError('QR kodu süresi dolmuş', 400);
  }

  const existingScan = await repo.qrScanExists(qrToken.id, student.id);
  if (existingScan) throw new AppError('Bu QR kodunu zaten tarattınız', 409);

  const enrollment = await prisma.enrollment.findFirst({
    where: { studentId: student.id, courseSectionId: qrToken.courseSectionId, status: { in: ['ACTIVE', 'APPROVED'] } },
  });
  if (!enrollment) throw new AppError('Bu derse kayıtlı değilsiniz', 403);

  const scan = await repo.qrScanCreate({ tokenId: qrToken.id, studentId: student.id });

  try {
    const section = await prisma.courseSection.findUnique({
      where: { id: qrToken.courseSectionId },
      include: { course: true },
    });
    getIO()
      .to(`lecturer:${qrToken.createdBy}`)
      .emit('qr:scan', { studentId: student.id, courseName: section?.course?.name, scannedAt: scan.scannedAt });
  } catch {}

  return { message: 'Kayıt başarılı', scannedAt: scan.scannedAt };
};

export const deactivateQRToken = async (userId, tokenId) => {
  const lecturer = await prisma.lecturer.findUnique({ where: { userId }, select: { id: true } });
  if (!lecturer) throw new AppError('Akademisyen profili bulunamadı', 404);

  const qrToken = await prisma.qRToken.findUnique({ where: { id: tokenId } });
  if (!qrToken) throw new AppError('QR token bulunamadı', 404);
  if (qrToken.createdBy !== lecturer.id) throw new AppError('Yetkiniz yok', 403);

  return repo.qrTokenDeactivate(tokenId);
};

export const getSectionScans = async (courseSectionId) => {
  return repo.qrTokenFindBySection(courseSectionId);
};

export const getRecentScans = async (courseSectionId) => {
  return repo.qrTokenGetRecentScans(courseSectionId);
};
