import * as repo from '../repositories/analytics.repository.js';
import { AppError } from '../utils/appError.util.js';

export const getAdvisorStudents = async (userId) => {
  const lecturer = await import('../config/prisma.js').then((m) =>
    m.default.lecturer.findUnique({ where: { userId }, select: { id: true } }),
  );
  if (!lecturer) throw new AppError('Akademisyen profili bulunamadı', 404);

  const advisees = await repo.getAdvisorAdvisees(lecturer.id);

  const studentsWithRisk = advisees.map((a) => {
    const s = a.student;
    const activeEnrollments = s.enrollments.filter((e) => e.status === 'ACTIVE' || e.status === 'APPROVED');
    const grades = activeEnrollments.filter((e) => e.grade && e.grade.gradePoint !== null);

    let cumGpa = 0,
      totalCred = 0;
    for (const e of grades) {
      if (e.grade.gradePoint !== null) {
        totalCred += e.courseSection.course.credit;
        cumGpa += e.grade.gradePoint * e.courseSection.course.credit;
      }
    }
    const gpa = totalCred > 0 ? Math.round((cumGpa / totalCred) * 100) / 100 : 0;

    const riskFlags = [];
    if (gpa < 2.0) riskFlags.push('GPA düşük (2.0 altı)');
    const failedCourses = grades.filter((e) => e.grade.gradePoint === 0).length;
    if (failedCourses >= 3) riskFlags.push(`${failedCourses} dersten başarısız`);

    const avgAttendance =
      activeEnrollments.length > 0
        ? activeEnrollments.reduce((s, e) => s + (e.attendance?.length || 0), 0) / activeEnrollments.length
        : 0;

    const riskLevel = riskFlags.length >= 2 ? 'HIGH' : riskFlags.length === 1 ? 'MEDIUM' : 'LOW';

    return {
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      studentNumber: s.studentNumber,
      department: s.department.name,
      classYear: s.classYear,
      gpa,
      totalCredits: totalCred,
      activeCourses: activeEnrollments.length,
      failedCourses,
      riskLevel,
      riskFlags,
    };
  });

  return {
    advisees: studentsWithRisk,
    summary: {
      total: studentsWithRisk.length,
      highRisk: studentsWithRisk.filter((s) => s.riskLevel === 'HIGH').length,
      mediumRisk: studentsWithRisk.filter((s) => s.riskLevel === 'MEDIUM').length,
      lowRisk: studentsWithRisk.filter((s) => s.riskLevel === 'LOW').length,
    },
  };
};

export const getAdvisorStudentDetail = async (userId, studentId) => {
  const lecturer = await import('../config/prisma.js').then((m) =>
    m.default.lecturer.findUnique({ where: { userId }, select: { id: true } }),
  );
  if (!lecturer) throw new AppError('Akademisyen profili bulunamadı', 404);

  const assignment = await import('../config/prisma.js').then((m) =>
    m.default.advisorAssignment.findFirst({ where: { lecturerId: lecturer.id, studentId, isActive: true } }),
  );
  if (!assignment) throw new AppError('Bu öğrenci size danışan değil', 403);

  const student = await repo.studentFindById(studentId);
  if (!student) throw new AppError('Öğrenci bulunamadı', 404);

  const grades = await repo.getStudentGrades(studentId);
  const attendances = await repo.getStudentAttendance(studentId);

  return { student, grades, attendances };
};
