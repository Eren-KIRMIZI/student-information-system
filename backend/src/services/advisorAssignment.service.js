import * as repo from '../repositories/advisorAssignment.repository.js';
import { AppError } from '../utils/appError.util.js';

const paginate = (page, limit) => ({ skip: (Number(page) - 1) * Number(limit), take: Number(limit) });

export const listAssignments = async ({ page = 1, limit = 20, lecturerId, studentId }) => {
  const [data, total] = await repo.advisorFindMany({ ...paginate(page, limit), lecturerId, studentId });
  return { data, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } };
};

export const getAdvisees = async (lecturerId) => {
  const assignments = await repo.advisorFindAdvisees(lecturerId);
  return assignments.map(a => a.student);
};

export const createAssignment = async (data) => {
  const { studentId, lecturerId } = data;
  if (!studentId || !lecturerId) throw new AppError('Öğrenci ve akademisyen seçimi zorunludur', 400);
  return repo.advisorCreate({ studentId, lecturerId, academicYear: data.academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}` });
};

export const deactivateAssignment = async (id) => {
  const a = await repo.advisorFindById(id);
  if (!a) throw new AppError('Atama bulunamadı', 404);
  return repo.advisorDeactivate(id);
};
