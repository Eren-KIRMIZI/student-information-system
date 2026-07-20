import * as repo from '../repositories/announcement.repository.js';
import { AppError } from '../utils/appError.util.js';
import { cache } from '../utils/cache.js';

const paginate = (p = 1, l = 10) => ({ skip: (Number(p) - 1) * Number(l), take: Number(l) });

const ROLE_MAP = {
  STUDENT: ['ALL', 'STUDENT'],
  ACADEMICIAN: ['ALL', 'ACADEMICIAN'],
  ADMIN: ['ALL', 'ADMIN', 'STUDENT', 'ACADEMICIAN'],
};

export const getAnnouncements = async (query, userRole) => {
  const { page = 1, limit = 10, category, targetRole } = query;
  const cacheKey = `ann:${userRole}:${JSON.stringify({page,limit,category,targetRole})}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

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
  const result = { data, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } };
  await cache.set(cacheKey, result, 180);
  return result;
};

export const getAnnouncementById = async (id) => {
  const a = await repo.announcementFindById(id);
  if (!a) throw new AppError('Duyuru bulunamadı', 404);
  return a;
};

export const createAnnouncement = async (data, userId) => {
  const result = await repo.announcementCreate({ ...data, publishedById: userId });
  await cache.invalidatePattern('ann:*');
  await cache.invalidatePattern('dash:*');
  return result;
};

export const updateAnnouncement = async (id, data) => {
  await getAnnouncementById(id);
  const result = await repo.announcementUpdate(id, data);
  await cache.invalidatePattern('ann:*');
  await cache.invalidatePattern('dash:*');
  return result;
};

export const deleteAnnouncement = async (id) => {
  await getAnnouncementById(id);
  const result = await repo.announcementDelete(id);
  await cache.invalidatePattern('ann:*');
  await cache.invalidatePattern('dash:*');
  return result;
};
