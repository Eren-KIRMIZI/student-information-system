import prisma from '../config/prisma.js';

export const roleFindMany = () =>
  prisma.role.findMany({ include: { _count: { select: { users: true } } } });

export const roleFindById = (id) =>
  prisma.role.findUnique({ where: { id } });

export const roleUpdate = (id, data) =>
  prisma.role.update({ where: { id }, data });
