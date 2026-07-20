import * as repo from '../repositories/analytics.repository.js';
import prisma from '../config/prisma.js';

export const getAdminKPIs = async () => {
  const [totalStudents, totalLecturers, totalCourses, enrollmentStats, gradeDistribution, departmentStats] = await Promise.all([
    repo.getStudentCount(),
    repo.getLecturerCount(),
    repo.getCourseCount(),
    repo.getEnrollmentStats(),
    repo.getGradeDistribution(),
    repo.getDepartmentStats(),
  ]);

  const totalEnrollments = enrollmentStats.reduce((sum, e) => sum + e._count.id, 0);
  const pendingEnrollments = enrollmentStats.find(e => e.status === 'PENDING')?._count.id || 0;
  const activeEnrollments = enrollmentStats.find(e => e.status === 'ACTIVE')?._count.id || 0;
  const droppedEnrollments = enrollmentStats.find(e => e.status === 'DROPPED')?._count.id || 0;

  const letterCounts = {};
  for (const g of gradeDistribution) {
    letterCounts[g.letterGrade] = (letterCounts[g.letterGrade] || 0) + 1;
  }

  const departments = await prisma.department.findMany({ include: { _count: { select: { students: true, courses: true } }, faculty: true } });

  const recentEnrollments = await prisma.enrollment.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { student: true, courseSection: { include: { course: true } } },
  });

  const gpaDistribution = await prisma.student.groupBy({ by: ['departmentId'], _avg: { gpa: true }, _count: { id: true } });

  return {
    overview: { totalStudents, totalLecturers, totalCourses, totalEnrollments, pendingEnrollments, activeEnrollments, droppedEnrollments },
    gradeDistribution: letterCounts,
    departments: departments.map(d => ({ id: d.id, name: d.name, faculty: d.faculty.name, studentCount: d._count.students, courseCount: d._count.courses })),
    gpaByDepartment: gpaDistribution.filter(g => g.departmentId).map(g => ({ departmentId: g.departmentId, avgGpa: g._avg.gpa ? Math.round(g._avg.gpa * 100) / 100 : 0, studentCount: g._count.id })),
    recentEnrollments,
  };
};
