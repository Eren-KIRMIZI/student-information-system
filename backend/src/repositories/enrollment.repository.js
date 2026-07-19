import prisma from '../config/prisma.js';

export const enrollmentFindMany = (params) => {
  const { skip = 0, take = 20, status, courseSectionId, studentId, sortBy = 'createdAt', order = 'desc' } = params;
  const where = {};
  if (status) where.status = status;
  if (courseSectionId) where.courseSectionId = courseSectionId;
  if (studentId) where.studentId = studentId;
  return Promise.all([
    prisma.enrollment.findMany({ where, skip, take, orderBy: { [sortBy]: order }, include: { student: true, courseSection: { include: { course: true, lecturer: true } } } }),
    prisma.enrollment.count({ where }),
  ]);
};

export const enrollmentFindById = (id) => prisma.enrollment.findUnique({ where: { id }, include: { student: true, courseSection: { include: { course: true, lecturer: true } } } });

export const enrollmentFindForStudent = (studentId) =>
  prisma.enrollment.findMany({
    where: { studentId },
    include: { courseSection: { include: { course: true, lecturer: true, weeklySlots: true } }, grade: true },
    orderBy: { createdAt: 'desc' },
  });

export const enrollmentFindDuplicate = (studentId, courseSectionId) =>
  prisma.enrollment.findFirst({ where: { studentId, courseSectionId, status: { not: 'REJECTED' } } });

export const enrollmentCountActive = (courseSectionId) =>
  prisma.enrollment.count({ where: { courseSectionId, status: { in: ['ACTIVE', 'APPROVED', 'PENDING'] } } });

export const enrollmentSumEcts = (studentId, academicYear, semester) =>
  prisma.enrollment.findMany({
    where: { studentId, status: { in: ['ACTIVE', 'APPROVED', 'PENDING'] }, courseSection: { academicYear, semester } },
    include: { courseSection: { include: { course: true } } },
  }).then(list => list.reduce((s, e) => s + e.courseSection.course.ects, 0));

export const enrollmentGetStudentSlots = (studentId) =>
  prisma.weeklySchedule.findMany({
    where: { courseSection: { enrollments: { some: { studentId, status: { in: ['ACTIVE', 'APPROVED', 'PENDING'] } } } } },
  });

export const enrollmentGetSectionSlots = (courseSectionId) =>
  prisma.weeklySchedule.findMany({ where: { courseSectionId } });

export const enrollmentCreate = (data) =>
  prisma.enrollment.create({ data, include: { courseSection: { include: { course: true } } } });

export const enrollmentUpdate = (id, data) =>
  prisma.enrollment.update({ where: { id }, data });

export const enrollmentFindByIdSimple = (id) =>
  prisma.enrollment.findUnique({ where: { id } });

export const studentFindByUserId = (userId) =>
  prisma.student.findUnique({ where: { userId }, select: { id: true } });
