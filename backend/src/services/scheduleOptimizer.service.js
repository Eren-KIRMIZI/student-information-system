import prisma from '../config/prisma.js';
import { AppError } from '../utils/appError.util.js';

export const getScheduleConflicts = async (userId) => {
  const student = await prisma.student.findUnique({ where: { userId }, select: { id: true } });
  if (!student) throw new AppError('Öğrenci profili bulunamadı', 404);

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: student.id, status: { in: ['ACTIVE', 'APPROVED', 'PENDING'] } },
    include: {
      courseSection: {
        include: { course: true, weeklySlots: true, lecturer: { select: { firstName: true, lastName: true } } },
      },
    },
  });

  const slots = [];
  for (const e of enrollments) {
    for (const slot of e.courseSection.weeklySlots) {
      slots.push({
        ...slot,
        courseName: e.courseSection.course.name,
        courseCode: e.courseSection.course.code,
        lecturerName: `${e.courseSection.lecturer.firstName} ${e.courseSection.lecturer.lastName}`,
      });
    }
  }

  const conflicts = [];
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      if (slots[i].dayOfWeek === slots[j].dayOfWeek) {
        if (!(slots[i].endTime <= slots[j].startTime || slots[i].startTime >= slots[j].endTime)) {
          conflicts.push({ slot1: slots[i], slot2: slots[j] });
        }
      }
    }
  }

  const freeSlots = [];
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const hours = ['08:30', '09:30', '10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:30'];
  for (const day of days) {
    for (const hour of hours) {
      const endHour = String(Number(hour.split(':')[0]) + 1).padStart(2, '0') + ':30';
      const isOccupied = slots.some((s) => s.dayOfWeek === day && !(s.endTime <= hour || s.startTime >= endHour));
      if (!isOccupied) freeSlots.push({ dayOfWeek: day, startTime: hour, endTime: endHour });
    }
  }

  return {
    enrolledSections: enrollments.map((e) => ({
      id: e.courseSectionId,
      courseName: e.courseSection.course.name,
      courseCode: e.courseSection.course.code,
      slots: e.courseSection.weeklySlots,
    })),
    conflicts,
    freeSlots,
    totalCredits: enrollments.reduce((sum, e) => sum + e.courseSection.course.ects, 0),
  };
};

export const getAvailableSections = async (userId, courseId) => {
  const student = await prisma.student.findUnique({ where: { userId }, select: { id: true } });
  if (!student) throw new AppError('Öğrenci profili bulunamadı', 404);

  const sections = await prisma.courseSection.findMany({
    where: { courseId, status: 'ACTIVE' },
    include: {
      course: true,
      lecturer: { select: { firstName: true, lastName: true } },
      weeklySlots: true,
      _count: { select: { enrollments: { where: { status: { in: ['ACTIVE', 'APPROVED', 'PENDING'] } } } } },
    },
  });

  const mySlots = [];
  const myEnrollments = await prisma.enrollment.findMany({
    where: { studentId: student.id, status: { in: ['ACTIVE', 'APPROVED', 'PENDING'] } },
    include: { courseSection: { include: { weeklySlots: true } } },
  });
  for (const e of myEnrollments) {
    mySlots.push(...e.courseSection.weeklySlots);
  }

  return sections.map((s) => {
    const hasConflict = s.weeklySlots.some((slot) =>
      mySlots.some(
        (ms) => ms.dayOfWeek === slot.dayOfWeek && !(slot.endTime <= ms.startTime || slot.startTime >= ms.endTime),
      ),
    );
    const hasQuota = s._count.enrollments < s.quota;
    return {
      id: s.id,
      courseCode: s.course.code,
      lecturerName: `${s.lecturer.firstName} ${s.lecturer.lastName}`,
      quota: s.quota,
      enrolled: s._count.enrollments,
      available: hasQuota,
      conflict: hasConflict,
      schedule: s.weeklySlots.map((sl) => ({
        dayOfWeek: sl.dayOfWeek,
        startTime: sl.startTime,
        endTime: sl.endTime,
        room: sl.room,
      })),
    };
  });
};
