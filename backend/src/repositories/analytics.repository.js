import prisma from '../config/prisma.js';

export const studentFindByUserId = (userId) =>
  prisma.student.findUnique({ where: { userId }, include: { department: true } });

export const studentFindById = (id) =>
  prisma.student.findUnique({ where: { id }, include: { department: true } });

export const getStudentGrades = (studentId) =>
  prisma.grade.findMany({
    where: { enrollment: { studentId }, isFinalized: true },
    include: { enrollment: { include: { courseSection: { include: { course: true } } } } },
    orderBy: [{ enrollment: { courseSection: { academicYear: 'asc' } } }, { enrollment: { courseSection: { semester: 'asc' } } }],
  });

export const getStudentAttendance = (studentId) =>
  prisma.attendance.findMany({
    where: { enrollment: { studentId } },
    include: { enrollment: { include: { courseSection: { include: { course: true } } } } },
    orderBy: { date: 'desc' },
  });

export const getLecturerStudents = (lecturerId) =>
  prisma.student.findMany({
    where: { enrollments: { some: { courseSection: { lecturerId }, status: { in: ['ACTIVE', 'APPROVED'] } } } },
    include: { department: true, enrollments: { where: { status: { in: ['ACTIVE', 'APPROVED'] } }, include: { courseSection: { include: { course: true } }, grade: true } } },
  });

export const getAdvisorAdvisees = (lecturerId) =>
  prisma.advisorAssignment.findMany({
    where: { lecturerId, isActive: true },
    include: { student: { include: { department: true, enrollments: { include: { courseSection: { include: { course: true } }, grade: true } } } } },
  });

export const getAllStudents = () =>
  prisma.student.findMany({ include: { department: true } });

export const getDepartmentStats = () =>
  prisma.student.groupBy({ by: ['departmentId'], _count: { id: true } });

export const getEnrollmentStats = () =>
  prisma.enrollment.groupBy({ by: ['status'], _count: { id: true } });

export const getGradeDistribution = () =>
  prisma.grade.findMany({
    where: { isFinalized: true },
    select: { letterGrade: true },
  });

export const getSectionsWithEnrollments = () =>
  prisma.courseSection.findMany({
    include: { course: true, enrollments: { where: { status: { in: ['ACTIVE', 'APPROVED'] } } }, lecturer: { include: { user: { select: { firstName: true, lastName: true } } } }, weeklySlots: true },
  });

export const getStudentCount = () => prisma.student.count();
export const getLecturerCount = () => prisma.lecturer.count();
export const getCourseCount = () => prisma.course.count();
export const getEnrollmentCount = () => prisma.enrollment.count();
