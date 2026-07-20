import * as repo from '../repositories/waitlist.repository.js';
import { AppError } from '../utils/appError.util.js';
import { getIO } from '../config/socket.js';

export const joinWaitlist = async (userId, courseSectionId) => {
  const student = await import('../config/prisma.js').then(m => m.default.student.findUnique({ where: { userId }, select: { id: true } }));
  if (!student) throw new AppError('Öğrenci profili bulunamadı', 404);

  const section = await import('../config/prisma.js').then(m => m.default.courseSection.findUnique({
    where: { id: courseSectionId },
    include: { course: true, _count: { select: { enrollments: true } } },
  }));
  if (!section) throw new AppError('Ders şubesi bulunamadı', 404);

  const existing = await repo.waitlistFindEntry(student.id, courseSectionId);
  if (existing && existing.status === 'WAITING') throw new AppError('Zaten bekleme listesindesiniz', 409);

  const position = await repo.waitlistGetNextPosition(courseSectionId);
  return repo.waitlistCreate({ studentId: student.id, courseSectionId, position });
};

export const cancelWaitlist = async (userId, courseSectionId) => {
  const student = await import('../config/prisma.js').then(m => m.default.student.findUnique({ where: { userId }, select: { id: true } }));
  if (!student) throw new AppError('Öğrenci profili bulunamadı', 404);

  const entry = await repo.waitlistFindEntry(student.id, courseSectionId);
  if (!entry || entry.status !== 'WAITING') throw new AppError('Bekleme listesi kaydı bulunamadı', 404);

  return repo.waitlistCancel(entry.id);
};

export const getMyWaitlist = async (userId) => {
  const student = await import('../config/prisma.js').then(m => m.default.student.findUnique({ where: { userId }, select: { id: true } }));
  if (!student) throw new AppError('Öğrenci profili bulunamadı', 404);
  return repo.waitlistFindByStudent(student.id);
};

export const getWaitlistForSection = async (courseSectionId) => repo.waitlistFindActive(courseSectionId);

export const promoteFromWaitlist = async (waitlistEntryId) => {
  const entry = await import('../config/prisma.js').then(m => m.default.waitlist.findUnique({ where: { id: waitlistEntryId }, include: { student: true, courseSection: { include: { course: true } } } }));
  if (!entry || entry.status !== 'WAITING') throw new AppError('Bekleme listesi kaydı bulunamadı', 404);

  const section = entry.courseSection;
  const activeCount = await repo.enrollmentCountActive(section.id);
  if (activeCount >= section.quota) throw new AppError('Şube kontenjanı dolu', 400);

  const duplicate = await import('../config/prisma.js').then(m => m.default.enrollment.findFirst({ where: { studentId: entry.studentId, courseSectionId: section.id, status: { not: 'REJECTED' } } }));
  if (duplicate) throw new AppError('Öğrenci zaten bu derse kayıtlı', 409);

  await import('../config/prisma.js').then(m => m.default.enrollment.create({ data: { studentId: entry.studentId, courseSectionId: section.id, status: 'ACTIVE' } }));
  await repo.waitlistPromote(waitlistEntryId);

  try { getIO().to(`student:${entry.student.userId}`).emit('enrollment:promoted', { courseSectionId: section.id, courseName: section.course.name }); } catch {}

  return { message: `${entry.student.firstName} ${entry.student.lastName} derse kaydedildi` };
};
