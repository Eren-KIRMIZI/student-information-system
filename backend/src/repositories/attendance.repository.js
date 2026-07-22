import prisma from '../config/prisma.js';

export const studentFindByUserId = (userId) => prisma.student.findUnique({ where: { userId }, select: { id: true } });

export const attendanceFindByStudent = (studentId) =>
  prisma.attendance.findMany({
    where: { enrollment: { studentId } },
    include: { enrollment: { include: { courseSection: { include: { course: true } } } } },
    orderBy: { date: 'desc' },
  });

export const attendanceFindBySection = (courseSectionId, date) => {
  const where = { enrollment: { courseSectionId } };
  if (date) where.date = new Date(date);
  return prisma.attendance.findMany({
    where,
    include: { enrollment: { include: { student: true } } },
    orderBy: { date: 'desc' },
  });
};

export const attendanceBulkUpsert = (records, recordedById) =>
  prisma.$transaction(
    records.map((r) =>
      prisma.attendance.upsert({
        where: { enrollmentId_date: { enrollmentId: r.enrollmentId, date: new Date(r.date) } },
        update: { status: r.status, recordedById },
        create: { enrollmentId: r.enrollmentId, date: new Date(r.date), status: r.status, recordedById },
      }),
    ),
  );

export const lecturerFindByUserId = (userId) => prisma.lecturer.findUnique({ where: { userId }, select: { id: true } });
