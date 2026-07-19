import prisma from '../config/prisma.js';

export const findByEmailWithRole = (email) =>
  prisma.user.findUnique({
    where: { email },
    include: { role: true, student: true, lecturer: true },
  });

export const findByIdWithRole = (id) =>
  prisma.user.findUnique({
    where: { id },
    include: { role: true, student: true, lecturer: true },
  });

export const findById = (id) =>
  prisma.user.findUnique({
    where: { id },
    include: { role: true, student: { include: { department: { include: { faculty: true } } } }, lecturer: { include: { department: { include: { faculty: true } } } } },
  });

export const updateLastLogin = (id) =>
  prisma.user.update({
    where: { id },
    data: { lastLoginAt: new Date() },
  });

export const updatePassword = (id, hashedPassword) =>
  prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  });

export const findMany = ({ skip = 0, take = 20, where = {}, orderBy = { createdAt: 'desc' } }) =>
  Promise.all([
    prisma.user.findMany({ where, skip, take, orderBy, include: { role: true } }),
    prisma.user.count({ where }),
  ]);

export const create = (data) =>
  prisma.user.create({ data, include: { role: true } });

export const update = (id, data) =>
  prisma.user.update({ where: { id }, data, include: { role: true } });
