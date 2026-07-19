import * as repo from '../repositories/weeklySchedule.repository.js';
import { AppError } from '../utils/appError.util.js';

export const getMyWeeklySchedule = async (userId, role) => {
  if (role === 'STUDENT') {
    const student = await repo.studentFindByUserId(userId);
    if (!student) throw new AppError('Profil bulunamadı', 404);
    return repo.scheduleFindManyByStudent(student.id);
  }
  if (role === 'ACADEMICIAN') {
    const lecturer = await repo.lecturerFindByUserId(userId);
    if (!lecturer) throw new AppError('Profil bulunamadı', 404);
    return repo.scheduleFindManyByLecturer(lecturer.id);
  }
  throw new AppError('Geçersiz rol', 403);
};

export const getSectionWeeklySchedule = async (courseSectionId) => {
  return repo.scheduleFindBySection(courseSectionId);
};

export const createWeeklySlot = async (courseSectionId, data) => {
  return repo.scheduleCreate({ courseSectionId, ...data });
};

export const updateWeeklySlot = async (id, data) => {
  return repo.scheduleUpdate(id, data);
};

export const deleteWeeklySlot = async (id) => {
  return repo.scheduleDelete(id);
};
