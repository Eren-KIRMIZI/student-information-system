import * as repo from '../repositories/academicCalendar.repository.js';
import { AppError } from '../utils/appError.util.js';
import { cache } from '../utils/cache.js';
import { getIO } from '../config/socket.js';

const paginate = (p = 1, l = 20) => ({ skip: (Number(p) - 1) * Number(l), take: Number(l) });

export const getCalendarEvents = async (query) => {
  const { page = 1, limit = 50, category } = query;
  const cacheKey = `calendar:${JSON.stringify({ page, limit, category })}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  const { skip, take } = paginate(page, limit);
  const where = category ? { category } : {};
  const [data, total] = await Promise.all([repo.calendarFindMany(where, skip, take), repo.calendarCount(where)]);
  const result = {
    data,
    pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
  };
  await cache.set(cacheKey, result, 3600);
  return result;
};

export const getCalendarEventById = async (id) => {
  const event = await repo.calendarFindById(id);
  if (!event) throw new AppError('Etkinlik bulunamadı', 404);
  return event;
};

export const createCalendarEvent = async (data) => {
  const result = await repo.calendarCreate({
    ...data,
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate),
  });
  await cache.invalidatePattern('calendar:*');
  try {
    getIO().emit('calendar:created', result);
  } catch {}
  return result;
};

export const updateCalendarEvent = async (id, data) => {
  await getCalendarEventById(id);
  const payload = { ...data };
  if (payload.startDate) payload.startDate = new Date(payload.startDate);
  if (payload.endDate) payload.endDate = new Date(payload.endDate);
  const result = await repo.calendarUpdate(id, payload);
  await cache.invalidatePattern('calendar:*');
  try {
    getIO().emit('calendar:updated', result);
  } catch {}
  return result;
};

export const deleteCalendarEvent = async (id) => {
  await getCalendarEventById(id);
  const result = await repo.calendarDelete(id);
  await cache.invalidatePattern('calendar:*');
  try {
    getIO().emit('calendar:deleted', { id });
  } catch {}
  return result;
};
