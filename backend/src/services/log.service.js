import * as repo from '../repositories/log.repository.js';

const paginate = (p = 1, l = 50) => ({ skip: (Number(p) - 1) * Number(l), take: Number(l) });

export const getLogs = async (query) => {
  const { page = 1, limit = 50, action, userId, startDate, endDate } = query;
  const { skip, take } = paginate(page, limit);
  const where = {};
  if (action) where.action = { contains: action, mode: 'insensitive' };
  if (userId) where.userId = userId;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }
  const [data, total] = await Promise.all([repo.logFindMany(where, skip, take), repo.logCount(where)]);
  return {
    data,
    pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
  };
};

export const getAuditLogs = async (query) => {
  const { page = 1, limit = 50, entity, action, userId, startDate, endDate } = query;
  const { skip, take } = paginate(page, limit);
  const where = {};
  if (entity) where.entity = { contains: entity, mode: 'insensitive' };
  if (action) where.action = { contains: action, mode: 'insensitive' };
  if (userId) where.userId = userId;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }
  const [data, total] = await Promise.all([repo.auditLogFindMany(where, skip, take), repo.auditLogCount(where)]);
  return {
    data,
    pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
  };
};
