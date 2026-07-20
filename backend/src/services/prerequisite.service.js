import * as repo from '../repositories/prerequisite.repository.js';
import { AppError } from '../utils/appError.util.js';

export const listPrerequisites = async () => repo.prereqFindAll();

export const getPrerequisitesForCourse = async (courseId) => repo.prereqFindByCourse(courseId);

export const checkMyPrerequisites = async (userId, courseId) => {
  const student = await import('../config/prisma.js').then(m => m.default.student.findUnique({ where: { userId }, select: { id: true } }));
  if (!student) throw new AppError('Öğrenci profili bulunamadı', 404);
  return repo.prereqCheckSatisfied(student.id, courseId);
};

export const createPrerequisite = async ({ courseId, prereqCourseId, minGradePoint }) => {
  if (courseId === prereqCourseId) throw new AppError('Ders kendinin ön koşulu olamaz', 400);
  const existing = await repo.prereqFindByCourse(courseId);
  if (existing.some(p => p.prereqCourseId === prereqCourseId)) throw new AppError('Bu ön koşul zaten tanımlı', 409);
  return repo.prereqCreate({ courseId, prereqCourseId, minGradePoint: minGradePoint || null });
};

export const deletePrerequisite = async (id) => {
  const prereq = await import('../config/prisma.js').then(m => m.default.prerequisite.findUnique({ where: { id } }));
  if (!prereq) throw new AppError('Ön koşul bulunamadı', 404);
  return repo.prereqDelete(id);
};
