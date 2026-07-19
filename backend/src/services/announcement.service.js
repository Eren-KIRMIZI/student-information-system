import * as repo from '../repositories/announcement.repository.js';
import { AppError } from '../utils/appError.util.js';

const paginate = (p = 1, l = 10) => ({ skip: (Number(p) - 1) * Number(l), take: Number(l) });

const ROLE_MAP = {
  STUDENT: ['ALL', 'STUDENT'],
  ACADEMICIAN: ['ALL', 'ACADEMICIAN'],
  ADMIN: ['ALL', 'ADMIN', 'STUDENT', 'ACADEMICIAN'],
};

export const getAnnouncements = async (query, userRole) => {
  const { page = 1, limit = 10, category, targetRole } = query;
  const { skip, take } = paginate(page, limit);
  const where = {};
  if (category) where.category = category;
  if (targetRole) {
    where.targetRole = targetRole;
  } else {
    where.targetRole = { in: ROLE_MAP[userRole] || ['ALL'] };
  }
  const [data, total] = await Promise.all([
    repo.announcementFindMany(where, skip, take),
    repo.announcementCount(where),
  ]);
  return { data, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } };
};

export const getAnnouncementById = async (id) => {
  const a = await repo.announcementFindById(id);
  if (!a) throw new AppError('Duyuru bulunamadı', 404);
  return a;
};

export const createAnnouncement = async (data, userId) => {
  return repo.announcementCreate({ ...data, publishedById: userId });
};

export const updateAnnouncement = async (id, data) => {
  await getAnnouncementById(id);
  return repo.announcementUpdate(id, data);
};

export const deleteAnnouncement = async (id) => {
  await getAnnouncementById(id);
  return repo.announcementDelete(id);
};
