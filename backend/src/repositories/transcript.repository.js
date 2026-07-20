import prisma from '../config/prisma.js';

export const getStudentTranscript = (studentId) =>
  prisma.grade.findMany({
    where: { enrollment: { studentId }, isFinalized: true },
    include: {
      enrollment: {
        include: {
          courseSection: {
            include: { course: true, lecturer: { include: { user: { select: { firstName: true, lastName: true } } } } },
          },
        },
      },
    },
    orderBy: [{ enrollment: { courseSection: { academicYear: 'asc' } } }, { enrollment: { courseSection: { semester: 'asc' } } }],
  });

export const getStudentInfo = (userId) =>
  prisma.student.findUnique({
    where: { userId },
    include: { department: { include: { faculty: true } } },
  });
