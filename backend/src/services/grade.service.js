import * as repo from '../repositories/grade.repository.js';
import { AppError } from '../utils/appError.util.js';
import { computeLetterGrade, computeSemesterGPA, GRADE_POINT_MAP } from '../utils/gradeScale.js';

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
  }
  const { letter, point } = computeLetterGrade(midtermScore, finalScore, makeupScore);
  return repo.gradeUpsert(enrollmentId, {
    midtermScore, finalScore, makeupScore,
    letterGrade: letter, gradePoint: point, enteredById,
  });
};

export const finalizeGrade = async (enrollmentId) => {
  const grade = await repo.gradeFindById(enrollmentId);
  if (!grade) throw new AppError('Not bulunamadı', 404);
  return repo.gradeFinalize(enrollmentId);
};
