import * as repo from '../repositories/examSchedule.repository.js';
import { AppError } from '../utils/appError.util.js';

const VALID_EXAM_TYPES = ['MIDTERM', 'FINAL', 'MAKEUP'];

export const getMyExamSchedule = async (userId, role, examType) => {
  if (examType && !VALID_EXAM_TYPES.includes(examType)) {
    throw new AppError('Geçersiz sınav türü');
  }
  if (role === 'STUDENT') {
    const student = await repo.studentFindByUserId(userId);
    if (!student) throw new AppError('Profil bulunamadı', 404);
    return repo.examFindManyByStudent(student.id, examType);
  }
  if (role === 'ACADEMICIAN') {
    const lecturer = await repo.lecturerFindByUserId(userId);
    if (!lecturer) throw new AppError('Profil bulunamadı', 404);
    return repo.examFindManyByLecturer(lecturer.id, examType);
  }
  return [];
};

export const getSectionExamSchedule = async (courseSectionId) => {
  return repo.examFindBySection(courseSectionId);
};

export const createExamSlot = async (courseSectionId, data) => {
  const payload = { ...data, courseSectionId };
  if (payload.examDate) payload.examDate = new Date(payload.examDate);
  if (payload.supervisorId === '') payload.supervisorId = null;
  return repo.examCreate(payload);
};

export const updateExamSlot = async (id, data) => {
  const payload = { ...data };
  if (payload.examDate) payload.examDate = new Date(payload.examDate);
  if (payload.supervisorId === '') payload.supervisorId = null;
  return repo.examUpdate(id, payload);
};

export const deleteExamSlot = async (id) => {
  return repo.examDelete(id);
};
