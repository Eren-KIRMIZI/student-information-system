import * as repo from '../repositories/academicCalendar.repository.js';
import { AppError } from '../utils/appError.util.js';

const paginate = (p = 1, l = 20) => ({ skip: (Number(p) - 1) * Number(l), take: Number(l) });

export const getCalendarEvents = async (query) => {
  const { page = 1, limit = 50, category } = query;
  const { skip, take } = paginate(page, limit);
  const where = category ? { category } : {};
  const [data, total] = await Promise.all([
    repo.calendarFindMany(where, skip, take),
    repo.calendarCount(where),
  ]);
  return { data, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } };
};

export const getCalendarEventById = async (id) => {
  const event = await repo.calendarFindById(id);
  if (!event) throw new AppError('Etkinlik bulunamadı', 404);
  return event;
};

export const createCalendarEvent = async (data) => {
  return repo.calendarCreate({
    ...data,
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate),
  });
};

export const updateCalendarEvent = async (id, data) => {
  await getCalendarEventById(id);
  const payload = { ...data };
  if (payload.startDate) payload.startDate = new Date(payload.startDate);
  if (payload.endDate) payload.endDate = new Date(payload.endDate);
  return repo.calendarUpdate(id, payload);
};

export const deleteCalendarEvent = async (id) => {
  await getCalendarEventById(id);
  return repo.calendarDelete(id);
};
