import prisma from '../config/prisma.js';

export const studentFindByUserId = (userId) =>
  prisma.student.findUnique({ where: { userId }, include: { department: { include: { faculty: true } } } });

export const studentFindById = (id) =>
  prisma.student.findUnique({ where: { id }, include: { department: { include: { faculty: true } } } });

export const getStudentGrades = (studentId) =>
  prisma.grade.findMany({
    where: { enrollment: { studentId }, isFinalized: true },
    include: { enrollment: { include: { courseSection: { include: { course: true } } } } },
  });

export const getStudentEnrollments = (studentId) =>
  prisma.enrollment.findMany({
    where: { studentId, status: { in: ['ACTIVE', 'COMPLETED'] } },
    include: { courseSection: { include: { course: true } } },
  });

export const getDepartmentCourses = (departmentId) =>
  prisma.course.findMany({ where: { departmentId }, include: { prerequisites: { include: { prereqCourse: true } } } });

export const getGraduationRequirement = (departmentId) =>
  prisma.graduationRequirement.findUnique({ where: { departmentId } });

export const upsertGraduationRequirement = (departmentId, data) =>
  prisma.graduationRequirement.upsert({ where: { departmentId }, update: data, create: { departmentId, ...data } });

export const getSemesterGrades = (studentId) =>
  prisma.grade.findMany({
    where: { enrollment: { studentId }, isFinalized: true },
    include: { enrollment: { include: { courseSection: { include: { course: true } } } } },
    orderBy: { enrollment: { courseSection: { academicYear: 'asc', semester: 'asc' } } },
  });
