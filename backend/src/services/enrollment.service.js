import * as repo from '../repositories/enrollment.repository.js';
import { AppError } from '../utils/appError.util.js';
import { cache } from '../utils/cache.js';
import { getIO } from '../config/socket.js';
import prisma from '../config/prisma.js';

const MAX_ECTS = Number(process.env.MAX_ECTS_PER_SEMESTER) || 45;

const paginate = (page, limit) => ({ skip: (Number(page) - 1) * Number(limit), take: Number(limit) });

export const listEnrollments = async ({ page = 1, limit = 20, status, courseSectionId, studentId, sortBy, order }) => {
  const cappedLimit = Math.min(Number(limit), 100);
  const [data, total] = await repo.enrollmentFindMany({
    ...paginate(page, cappedLimit),
    status,
    courseSectionId,
    studentId,
    sortBy,
    order,
  });
  return {
    data,
    pagination: { page: Number(page), limit: cappedLimit, total, totalPages: Math.ceil(total / cappedLimit) },
  };
};

export const getMyEnrollments = async (userId) => {
  const student = await repo.studentFindByUserId(userId);
  if (!student) throw new AppError('Öğrenci profili bulunamadı', 404);
  return repo.enrollmentFindForStudent(student.id);
};

export const createEnrollment = async (userId, courseSectionId) => {
  const student = await repo.studentFindByUserId(userId);
  if (!student) throw new AppError('Öğrenci profili bulunamadı', 404);

  const section = await import('../config/prisma.js').then((m) =>
    m.default.courseSection.findUnique({
      where: { id: courseSectionId },
      include: { _count: { select: { enrollments: true } }, course: true },
    }),
  );
  if (!section) throw new AppError('Ders şubesi bulunamadı', 404);

  // Rule 1: Section closed/archived
  if (section.isArchived) throw new AppError('Bu şube arşivlenmiş', 400, null, 'SECTION_CLOSED');

  // Rule 2: Quota full
  const activeCount = await repo.enrollmentCountActive(courseSectionId);
  if (activeCount >= section.quota) throw new AppError('Kontenjan dolu', 400, null, 'QUOTA_FULL');

  // Rule 3: Already enrolled
  const exists = await repo.enrollmentFindDuplicate(student.id, courseSectionId);
  if (exists) throw new AppError('Bu derse zaten kayıtlısınız', 409, null, 'ALREADY_ENROLLED');

  // Rule 4: ECTS limit
  const currentEcts = await repo.enrollmentSumEcts(student.id, section.academicYear, section.semester);
  if (currentEcts + section.course.ects > MAX_ECTS) {
    throw new AppError(`Maksimum AKTS sınırı (${MAX_ECTS}) aşılıyor`, 400, null, 'ECTS_LIMIT_EXCEEDED');
  }

  // Rule 5: Schedule conflict
  const mySlots = await repo.enrollmentGetStudentSlots(student.id);
  const newSlots = await repo.enrollmentGetSectionSlots(courseSectionId);
  for (const ns of newSlots) {
    for (const ms of mySlots) {
      if (ns.dayOfWeek === ms.dayOfWeek) {
        const conflict = !(ns.endTime <= ms.startTime || ns.startTime >= ms.endTime);
        if (conflict) throw new AppError('Ders programı çakışması var', 409, null, 'SCHEDULE_CONFLICT');
      }
    }
  }

  const result = await repo.enrollmentCreate({ studentId: student.id, courseSectionId, status: 'PENDING' });
  await cache.invalidatePattern('dash:*');
  try {
    getIO()
      .to('role:admin')
      .to('role:academician')
      .emit('enrollment:created', { enrollmentId: result.id, studentId: student.id });
  } catch {}
  return result;
};

const checkAcademicianSectionOwnership = async (enrollmentId, reqUser) => {
  if (reqUser.role === 'ADMIN') return;
  if (reqUser.role === 'ACADEMICIAN') {
    const lecturer = await prisma.lecturer.findUnique({ where: { userId: reqUser.id }, select: { id: true } });
    const enrollment = await repo.enrollmentFindByIdSimple(enrollmentId);
    if (!enrollment) throw new AppError('Kayıt bulunamadı', 404);
    const section = await prisma.courseSection.findUnique({
      where: { id: enrollment.courseSectionId },
      select: { lecturerId: true },
    });
    if (section && section.lecturerId !== lecturer?.id) {
      throw new AppError('Bu kaydı işleme yetkiniz yok', 403);
    }
  }
};

export const approveEnrollment = async (id, reqUser) => {
  const e = await repo.enrollmentFindByIdSimple(id);
  if (!e) throw new AppError('Kayıt bulunamadı', 404);
  await checkAcademicianSectionOwnership(id, reqUser);
  const result = await repo.enrollmentUpdate(id, { status: 'ACTIVE' });
  await cache.invalidatePattern('dash:*');
  try {
    getIO().to(`student:${e.student.userId}`).emit('enrollment:updated', { enrollmentId: id, status: 'ACTIVE' });
  } catch {}
  return result;
};

export const rejectEnrollment = async (id, reqUser) => {
  const e = await repo.enrollmentFindByIdSimple(id);
  if (!e) throw new AppError('Kayıt bulunamadı', 404);
  await checkAcademicianSectionOwnership(id, reqUser);
  const result = await repo.enrollmentUpdate(id, { status: 'REJECTED' });
  await cache.invalidatePattern('dash:*');
  try {
    getIO().to(`student:${e.student.userId}`).emit('enrollment:updated', { enrollmentId: id, status: 'REJECTED' });
  } catch {}
  return result;
};

export const dropEnrollment = async (id, reqUser) => {
  const e = await repo.enrollmentFindByIdSimple(id);
  if (!e) throw new AppError('Kayıt bulunamadı', 404);
  if (e.status === 'COMPLETED') throw new AppError('Tamamlanmış ders bırakılamaz', 400);

  if (reqUser.role === 'STUDENT') {
    const student = await repo.studentFindByUserId(reqUser.id);
    if (!student || e.studentId !== student.id) {
      throw new AppError('Bu kaydı bırakma yetkiniz yok', 403);
    }
  }

  const result = await repo.enrollmentUpdate(id, { status: 'DROPPED' });
  await cache.invalidatePattern('dash:*');
  return result;
};
