import prisma from '../config/prisma.js';

export const announcementFindMany = (where, skip, take) =>
  prisma.announcement.findMany({
    where, skip, take,
    orderBy: { publishedAt: 'desc' },
    include: { publishedBy: { select: { email: true } } },
  });

export const announcementCount = (where) =>
  prisma.announcement.count({ where });

export const announcementFindById = (id) =>
  prisma.announcement.findUnique({
    where: { id },
    include: { publishedBy: { select: { email: true } } },
  });

export const announcementCreate = (data) =>
  prisma.announcement.create({
    data,
    include: { publishedBy: { select: { email: true } } },
  });

export const announcementUpdate = (id, data) =>
  prisma.announcement.update({ where: { id }, data });

export const announcementDelete = (id) =>
  prisma.announcement.delete({ where: { id } });
