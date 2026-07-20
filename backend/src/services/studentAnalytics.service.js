import * as repo from '../repositories/analytics.repository.js';
import { AppError } from '../utils/appError.util.js';

export const getMyAnalytics = async (userId) => {
  const student = await repo.studentFindByUserId(userId);
  if (!student) throw new AppError('Öğrenci profili bulunamadı', 404);

  const grades = await repo.getStudentGrades(student.id);
  const attendances = await repo.getStudentAttendance(student.id);

  const semesterMap = {};
  for (const g of grades) {
    const cs = g.enrollment.courseSection;
    const key = `${cs.academicYear}-${cs.semester}`;
    if (!semesterMap[key]) semesterMap[key] = { academicYear: cs.academicYear, semester: cs.semester, courses: [], totalCredits: 0, totalPoints: 0 };
    semesterMap[key].courses.push({ code: cs.course.code, name: cs.course.name, credit: cs.course.credit, gradePoint: g.gradePoint, letterGrade: g.letterGrade });
    if (g.gradePoint !== null) {
      semesterMap[key].totalCredits += cs.course.credit;
      semesterMap[key].totalPoints += g.gradePoint * cs.course.credit;
    }
  }

  const gpaTrends = Object.values(semesterMap).map(s => ({
    academicYear: s.academicYear,
    semester: s.semester,
    gpa: s.totalCredits > 0 ? Math.round((s.totalPoints / s.totalCredits) * 100) / 100 : 0,
    courseCount: s.courses.length,
  }));

  const letterCounts = {};
  for (const g of grades) {
    if (g.letterGrade) letterCounts[g.letterGrade] = (letterCounts[g.letterGrade] || 0) + 1;
  }
  const gradeDistribution = Object.entries(letterCounts).map(([letter, count]) => ({ letter, count })).sort((a, b) => a.letter.localeCompare(b.letter));

  const attendanceByCourse = {};
  for (const a of attendances) {
    const courseName = a.enrollment.courseSection.course.name;
    if (!attendanceByCourse[courseName]) attendanceByCourse[courseName] = { present: 0, absent: 0, late: 0, total: 0 };
    attendanceByCourse[courseName].total++;
    if (a.status === 'PRESENT') attendanceByCourse[courseName].present++;
    else if (a.status === 'ABSENT') attendanceByCourse[courseName].absent++;
    else if (a.status === 'LATE') attendanceByCourse[courseName].late++;
  }

  let cumGpa = 0, totalCred = 0;
  for (const g of grades) {
    if (g.gradePoint !== null) {
      totalCred += g.enrollment.courseSection.course.credit;
      cumGpa += g.gradePoint * g.enrollment.courseSection.course.credit;
    }
  }

  return {
    gpaTrends,
    gradeDistribution,
    attendanceSummary: Object.entries(attendanceByCourse).map(([courseName, data]) => ({ courseName, ...data, rate: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0 })),
    cumulativeGpa: totalCred > 0 ? Math.round((cumGpa / totalCred) * 100) / 100 : 0,
    totalCredits: totalCred,
    totalCourses: grades.length,
    passedCourses: grades.filter(g => g.gradePoint > 0).length,
    failedCourses: grades.filter(g => g.gradePoint === 0).length,
  };
};
