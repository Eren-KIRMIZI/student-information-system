import * as repo from '../repositories/grade.repository.js';
import { AppError } from '../utils/appError.util.js';
import { computeLetterGrade, computeSemesterGPA, GRADE_POINT_MAP } from '../utils/gradeScale.js';
import { cache } from '../utils/cache.js';
import { getIO } from '../config/socket.js';
import prisma from '../config/prisma.js';

export const getMyGrades = async (userId) => {
  const student = await import('../config/prisma.js').then(m => m.default.student.findUnique({ where: { userId }, select: { id: true } }));
  if (!student) throw new AppError('Profil bulunamadı', 404);
  return repo.gradeFindManyByStudent(student.id);
};

export const getMyTranscript = async (userId) => {
  const student = await repo.studentFindWithDept(userId);
  if (!student) throw new AppError('Profil bulunamadı', 404);
  const grades = await repo.gradeFindTranscript(student.id);
  const { gpa, totalCredits } = computeSemesterGPA(grades);
  return { student, grades, gpa, totalCredits };
};

export const updateGrade = async (enrollmentId, data, reqUser) => {
  const { midtermScore, finalScore, makeupScore } = data;
  let enteredById = null;
  if (reqUser.role === 'ACADEMICIAN') {
    const lecturer = await repo.lecturerFindByUserId(reqUser.id);
    enteredById = lecturer?.id;

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      select: { courseSection: { select: { lecturerId: true } } },
    });
    if (enrollment && enrollment.courseSection.lecturerId !== enteredById) {
      throw new AppError('Bu ders şubesine not girme yetkiniz yok', 403);
    }
  }
  const { letter, point } = computeLetterGrade(midtermScore, finalScore, makeupScore);
  const result = await repo.gradeUpsert(enrollmentId, {
    midtermScore, finalScore, makeupScore,
    letterGrade: letter, gradePoint: point, enteredById,
  });
  await cache.invalidatePattern('dash:*');
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      select: { student: { select: { userId: true } } },
    });
    if (enrollment?.student?.userId) {
      getIO().to(`student:${enrollment.student.userId}`).emit('grade:updated', { enrollmentId });
    }
  } catch {}
  return result;
};

export const finalizeGrade = async (enrollmentId) => {
  const grade = await repo.gradeFindById(enrollmentId);
  if (!grade) throw new AppError('Not bulunamadı', 404);
  const result = await repo.gradeFinalize(enrollmentId);
  await cache.invalidatePattern('dash:*');
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      select: { student: { select: { userId: true } } },
    });
    if (enrollment?.student?.userId) {
      getIO().to(`student:${enrollment.student.userId}`).emit('grade:updated', { enrollmentId });
    }
  } catch {}
  return result;
};
