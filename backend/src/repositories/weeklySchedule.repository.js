import prisma from '../config/prisma.js';

export const studentFindByUserId = (userId) => prisma.student.findUnique({ where: { userId }, select: { id: true } });

export const lecturerFindByUserId = (userId) => prisma.lecturer.findUnique({ where: { userId }, select: { id: true } });

export const scheduleFindManyByStudent = (studentId) =>
  prisma.weeklySchedule.findMany({
    where: { courseSection: { enrollments: { some: { studentId, status: { in: ['ACTIVE', 'APPROVED'] } } } } },
    include: { courseSection: { include: { course: true, lecturer: true } } },
    orderBy: { dayOfWeek: 'asc' },
  });

export const scheduleFindManyByLecturer = (lecturerId) =>
  prisma.weeklySchedule.findMany({
    where: { courseSection: { lecturerId } },
    include: { courseSection: { include: { course: true, lecturer: true } } },
    orderBy: { dayOfWeek: 'asc' },
  });

export const scheduleFindBySection = (courseSectionId) =>
  prisma.weeklySchedule.findMany({
    where: { courseSectionId },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  });

export const scheduleCreate = (data) => prisma.weeklySchedule.create({ data });

export const scheduleUpdate = (id, data) => prisma.weeklySchedule.update({ where: { id }, data });

export const scheduleDelete = (id) => prisma.weeklySchedule.delete({ where: { id } });
