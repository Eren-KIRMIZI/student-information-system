import * as dashboardRepository from '../repositories/dashboard.repository.js';
import { AppError } from '../utils/appError.util.js';
import prisma from '../config/prisma.js';
import { cache } from '../utils/cache.js';

export const getStudentDashboard = async (userId) => {
  const cacheKey = `dash:student:${userId}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) throw new AppError('Öğrenci profili bulunamadı', 404);
  const data = await dashboardRepository.getStudentDashboard(student.id, userId);
  await cache.set(cacheKey, data, 60);
  return data;
};

export const getAcademicianDashboard = async (userId) => {
  const cacheKey = `dash:academician:${userId}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  const lecturer = await prisma.lecturer.findUnique({ where: { userId } });
  if (!lecturer) throw new AppError('Akademisyen profili bulunamadı', 404);
  const data = await dashboardRepository.getAcademicianDashboard(lecturer.id, userId);
  await cache.set(cacheKey, data, 60);
  return data;
};

export const getAdminDashboard = async () => {
  const cacheKey = 'dash:admin';
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  const data = await dashboardRepository.getAdminDashboard();
  await cache.set(cacheKey, data, 60);
  return data;
};
