import * as repo from '../repositories/transcript.repository.js';
import { AppError } from '../utils/appError.util.js';

export const getMyTranscript = async (userId) => {
  const student = await repo.getStudentInfo(userId);
  if (!student) throw new AppError('Öğrenci profili bulunamadı', 404);

  const grades = await repo.getStudentTranscript(student.id);

  const semesterMap = {};
  for (const g of grades) {
    const cs = g.enrollment.courseSection;
    const key = `${cs.academicYear}-${cs.semester}`;
    if (!semesterMap[key]) semesterMap[key] = { academicYear: cs.academicYear, semester: cs.semester, courses: [], totalCredits: 0, totalPoints: 0 };
    const s = semesterMap[key];
    s.courses.push({
      courseCode: cs.course.code,
      courseName: cs.course.name,
      credit: cs.course.credit,
      ects: cs.course.ects,
      letterGrade: g.letterGrade,
      gradePoint: g.gradePoint,
      midterm: g.midtermScore,
      final: g.finalScore,
      makeup: g.makeupScore,
    });
    if (g.gradePoint !== null) {
      s.totalCredits += cs.course.credit;
      s.totalPoints += g.gradePoint * cs.course.credit;
    }
  }

  const semesters = Object.values(semesterMap).map(s => ({
    ...s,
    gpa: s.totalCredits > 0 ? Math.round((s.totalPoints / s.totalCredits) * 100) / 100 : 0,
  }));

  const allCredits = grades.filter(g => g.gradePoint !== null).reduce((sum, g) => sum + g.enrollment.courseSection.course.credit, 0);
  const allPoints = grades.filter(g => g.gradePoint !== null).reduce((sum, g) => sum + g.gradePoint * g.enrollment.courseSection.course.credit, 0);
  const cumulativeGpa = allCredits > 0 ? Math.round((allPoints / allCredits) * 100) / 100 : 0;

  const totalEctsCompleted = grades.filter(g => g.gradePoint !== null && g.gradePoint > 0).reduce((sum, g) => sum + g.enrollment.courseSection.course.ects, 0);

  return {
    student: { id: student.id, firstName: student.firstName, lastName: student.lastName, studentNumber: student.studentNumber, department: student.department.name, faculty: student.department.faculty.name, classYear: student.classYear },
    semesters,
    summary: { cumulativeGpa, totalCredits: allCredits, totalEctsCompleted, totalCourses: grades.length, coursesPassed: grades.filter(g => g.gradePoint > 0).length, coursesFailed: grades.filter(g => g.gradePoint === 0).length },
  };
};

export const getTranscriptForAdmin = async (studentId) => {
  const student = await repo.getStudentInfo(studentId);
  if (!student) throw new AppError('Öğrenci bulunamadı', 404);
  return getMyTranscript(student.userId);
};
