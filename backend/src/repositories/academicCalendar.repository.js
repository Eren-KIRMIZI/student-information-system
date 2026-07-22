import prisma from '../config/prisma.js';

export const calendarFindMany = (where, skip, take) =>
  prisma.academicCalendar.findMany({
    where,
    skip,
    take,
    orderBy: { startDate: 'asc' },
  });

export const calendarCount = (where) => prisma.academicCalendar.count({ where });

export const calendarFindById = (id) => prisma.academicCalendar.findUnique({ where: { id } });

export const calendarCreate = (data) => prisma.academicCalendar.create({ data });

export const calendarUpdate = (id, data) => prisma.academicCalendar.update({ where: { id }, data });

export const calendarDelete = (id) => prisma.academicCalendar.delete({ where: { id } });
