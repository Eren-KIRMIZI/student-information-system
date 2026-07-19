import prisma from '../config/prisma.js';

export const gradeFindManyByStudent = (studentId) =>
  prisma.grade.findMany({
    where: { enrollment: { studentId } },
    include: { enrollment: { include: { courseSection: { include: { course: true, lecturer: true } } } } },
  });

export const gradeFindTranscript = (studentId) =>
  prisma.grade.findMany({
    where: { enrollment: { studentId }, isFinalized: true },
    include: { enrollment: { include: { courseSection: { include: { course: true } } } } },
  });

export const studentFindWithDept = (userId) =>
  prisma.student.findUnique({ where: { userId }, include: { department: { include: { faculty: true } } } });

export const gradeFindById = (enrollmentId) =>
  prisma.grade.findUnique({ where: { enrollmentId } });

export const gradeUpsert = (enrollmentId, data) =>
  prisma.grade.upsert({
    where: { enrollmentId },
    update: data,
    create: { enrollmentId, ...data },
  });

export const gradeFinalize = (enrollmentId) =>
  prisma.grade.update({ where: { enrollmentId }, data: { isFinalized: true } });

export const lecturerFindByUserId = (userId) =>
  prisma.lecturer.findUnique({ where: { userId }, select: { id: true } });
