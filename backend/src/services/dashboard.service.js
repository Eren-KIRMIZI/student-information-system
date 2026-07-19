import * as dashboardRepository from '../repositories/dashboard.repository.js';
import { AppError } from '../utils/appError.util.js';
import prisma from '../config/prisma.js';

export const getStudentDashboard = async (userId) => {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) throw new AppError('Öğrenci profili bulunamadı', 404);
  return dashboardRepository.getStudentDashboard(student.id);
};

export const getAcademicianDashboard = async (userId) => {
  const lecturer = await prisma.lecturer.findUnique({ where: { userId } });
  if (!lecturer) throw new AppError('Akademisyen profili bulunamadı', 404);
  return dashboardRepository.getAcademicianDashboard(lecturer.id);
};

export const getAdminDashboard = async () => {
  return dashboardRepository.getAdminDashboard();
};
