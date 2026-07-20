import prisma from '../config/prisma.js';

export const prereqFindByCourse = (courseId) =>
  prisma.prerequisite.findMany({ where: { courseId }, include: { prereqCourse: true } });

export const prereqFindAll = () =>
  prisma.prerequisite.findMany({ include: { requiredCourse: true, prereqCourse: true } });

export const prereqCreate = (data) =>
  prisma.prerequisite.create({ data });

export const prereqDelete = (id) =>
  prisma.prerequisite.delete({ where: { id } });

export const prereqCheckSatisfied = async (studentId, courseId) => {
  const prereqs = await prisma.prerequisite.findMany({ where: { courseId } });
  if (!prereqs.length) return { satisfied: true, missing: [] };

  const missing = [];
  for (const prereq of prereqs) {
    const grade = await prisma.grade.findFirst({
      where: {
        enrollment: { studentId, courseSection: { courseId: prereq.prereqCourseId } },
        isFinalized: true,
      },
    });
    if (!grade) {
      missing.push({ courseId: prereq.prereqCourseId, courseCode: prereq.prereqCourse.code, reason: 'Ders hiç alınmamış' });
    } else if (grade.gradePoint !== null && prereq.minGradePoint && grade.gradePoint < prereq.minGradePoint) {
      missing.push({ courseId: prereq.prereqCourseId, courseCode: prereq.prereqCourse.code, gradePoint: grade.gradePoint, minRequired: prereq.minGradePoint, reason: 'Not yetersiz' });
    } else if (grade.gradePoint === null || grade.gradePoint === 0) {
      missing.push({ courseId: prereq.prereqCourseId, courseCode: prereq.prereqCourse.code, reason: 'Ders başarısız' });
    }
  }
  return { satisfied: missing.length === 0, missing };
};

export const studentHasCompletedCourse = async (studentId, courseId) => {
  const grade = await prisma.grade.findFirst({
    where: {
      enrollment: { studentId, courseSection: { courseId } },
      isFinalized: true,
      gradePoint: { gt: 0 },
    },
  });
  return !!grade;
};
