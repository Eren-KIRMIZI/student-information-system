import prisma from '../config/prisma.js';

export const waitlistFindActive = (courseSectionId) =>
  prisma.waitlist.findMany({
    where: { courseSectionId, status: 'WAITING' },
    orderBy: { position: 'asc' },
    include: { student: true },
  });

export const waitlistFindEntry = (studentId, courseSectionId) =>
  prisma.waitlist.findFirst({ where: { studentId, courseSectionId } });

export const waitlistGetNextPosition = async (courseSectionId) => {
  const max = await prisma.waitlist.aggregate({ where: { courseSectionId }, _max: { position: true } });
  return (max._max.position || 0) + 1;
};

export const waitlistCreate = (data) =>
  prisma.waitlist.create({ data, include: { student: true, courseSection: { include: { course: true } } } });

export const waitlistUpdate = (id, data) => prisma.waitlist.update({ where: { id }, data });

export const waitlistCancel = (id) => prisma.waitlist.update({ where: { id }, data: { status: 'CANCELLED' } });

export const waitlistPromote = (id) =>
  prisma.waitlist.update({ where: { id }, data: { status: 'PROMOTED', promotedAt: new Date() } });

export const waitlistFindByStudent = (studentId) =>
  prisma.waitlist.findMany({
    where: { studentId, status: { in: ['WAITING', 'PROMOTED'] } },
    include: { courseSection: { include: { course: true, lecturer: true } } },
    orderBy: { createdAt: 'desc' },
  });

export const enrollmentCountActive = (courseSectionId) =>
  prisma.enrollment.count({ where: { courseSectionId, status: { in: ['ACTIVE', 'APPROVED', 'PENDING'] } } });
