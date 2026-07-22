import prisma from '../config/prisma.js';

export const advisorFindMany = (params) => {
  const { skip = 0, take = 20, lecturerId, studentId } = params;
  const where = {};
  if (lecturerId) where.lecturerId = lecturerId;
  if (studentId) where.studentId = studentId;
  return Promise.all([
    prisma.advisorAssignment.findMany({
      where,
      skip,
      take,
      orderBy: { assignedAt: 'desc' },
      include: { student: true, lecturer: true },
    }),
    prisma.advisorAssignment.count({ where }),
  ]);
};

export const advisorFindAdvisees = (lecturerId) =>
  prisma.advisorAssignment.findMany({
    where: { lecturerId, isActive: true },
    include: { student: { include: { department: true, user: { select: { email: true } } } } },
  });

export const advisorFindById = (id) =>
  prisma.advisorAssignment.findUnique({ where: { id }, include: { student: true, lecturer: true } });

export const advisorCreate = (data) =>
  prisma.advisorAssignment.create({ data, include: { student: true, lecturer: true } });

export const advisorDeactivate = (id) => prisma.advisorAssignment.update({ where: { id }, data: { isActive: false } });
