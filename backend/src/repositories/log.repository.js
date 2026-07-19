import prisma from '../config/prisma.js';

export const logFindMany = (where, skip, take) =>
  prisma.log.findMany({
    where, skip, take,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { email: true, role: true } } },
  });

export const logCount = (where) =>
  prisma.log.count({ where });
