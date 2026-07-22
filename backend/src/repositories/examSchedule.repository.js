import prisma from '../config/prisma.js';

export const studentFindByUserId = (userId) => prisma.student.findUnique({ where: { userId }, select: { id: true } });

export const lecturerFindByUserId = (userId) => prisma.lecturer.findUnique({ where: { userId }, select: { id: true } });

export const examFindManyByStudent = (studentId, examType) => {
  const where = { courseSection: { enrollments: { some: { studentId, status: { in: ['ACTIVE', 'APPROVED'] } } } } };
  if (examType) where.examType = examType;
  return prisma.examSchedule.findMany({
    where,
    include: { courseSection: { include: { course: true, lecturer: true } } },
    orderBy: { examDate: 'asc' },
  });
};

export const examFindManyByLecturer = (lecturerId, examType) => {
  const where = { courseSection: { lecturerId } };
  if (examType) where.examType = examType;
  return prisma.examSchedule.findMany({
    where,
    include: { courseSection: { include: { course: true, lecturer: true } } },
    orderBy: { examDate: 'asc' },
  });
};

export const examFindBySection = (courseSectionId) =>
  prisma.examSchedule.findMany({
    where: { courseSectionId },
    include: { supervisor: true },
    orderBy: { examDate: 'asc' },
  });

export const examCreate = (data) => prisma.examSchedule.create({ data });

export const examUpdate = (id, data) => prisma.examSchedule.update({ where: { id }, data });

export const examDelete = (id) => prisma.examSchedule.delete({ where: { id } });
