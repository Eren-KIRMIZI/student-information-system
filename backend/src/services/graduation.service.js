import * as repo from '../repositories/graduation.repository.js';
import { AppError } from '../utils/appError.util.js';

export const getMyGraduationStatus = async (userId) => {
  const student = await repo.studentFindByUserId(userId);
  if (!student) throw new AppError('Öğrenci profili bulunamadı', 404);

  const requirement = await repo.getGraduationRequirement(student.departmentId);
  if (!requirement) throw new AppError('Mezuniyet kuralı tanımlı değil', 404);

  const grades = await repo.getStudentGrades(student.id);

  const passedGrades = grades.filter(g => g.gradePoint !== null && g.gradePoint > 0);
  const failedGrades = grades.filter(g => g.gradePoint !== null && g.gradePoint === 0);
  const ffGrades = grades.filter(g => g.letterGrade === 'FF');

  const totalCreditsCompleted = passedGrades.reduce((sum, g) => sum + g.enrollment.courseSection.course.credit, 0);
  const totalEctsCompleted = passedGrades.reduce((sum, g) => sum + g.enrollment.courseSection.course.ects, 0);

  let gpa = 0;
  if (passedGrades.length > 0) {
    const totalPoints = passedGrades.reduce((sum, g) => sum + g.gradePoint * g.enrollment.courseSection.course.credit, 0);
    const totalCredits = passedGrades.reduce((sum, g) => sum + g.enrollment.courseSection.course.credit, 0);
    gpa = totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0;
  }

  const passedCourseIds = new Set(passedGrades.map(g => g.enrollment.courseSection.courseId));
  const departmentCourses = await repo.getDepartmentCourses(student.departmentId);
  const remainingCourses = departmentCourses.filter(c => !passedCourseIds.has(c.id));

  const missingPrereqs = [];
  for (const course of remainingCourses) {
    for (const prereq of course.prerequisites) {
      if (!passedCourseIds.has(prereq.prereqCourseId)) {
        const pg = passedGrades.find(g => g.enrollment.courseSection.courseId === prereq.prereqCourseId);
        if (!pg) {
          missingPrereqs.push({ courseCode: course.code, missingPrereq: prereq.prereqCourse.code });
        }
      }
    }
  }

  const checks = {
    totalCredits: { current: totalCreditsCompleted, required: requirement.requiredCredits, met: totalCreditsCompleted >= requirement.requiredCredits },
    totalEcts: { current: totalEctsCompleted, required: requirement.totalEcts, met: totalEctsCompleted >= requirement.totalEcts },
    gpa: { current: gpa, minimum: requirement.minGpa, met: gpa >= requirement.minGpa },
    ffCount: { current: ffGrades.length, maximum: requirement.maxFfCount, met: ffGrades.length <= requirement.maxFfCount },
  };

  const canGraduate = Object.values(checks).every(c => c.met);

  return {
    student: { firstName: student.firstName, lastName: student.lastName, studentNumber: student.studentNumber, department: student.department.name },
    requirement,
    checks,
    canGraduate,
    remainingCourses: remainingCourses.map(c => ({ id: c.id, code: c.code, name: c.name, credit: c.credit, ects: c.ects })),
    missingPrereqs,
    summary: { totalCourses: grades.length, passed: passedGrades.length, failed: failedGrades.length, remaining: remainingCourses.length },
  };
};

export const checkStudentGraduation = async (studentId) => {
  const student = await repo.studentFindById(studentId);
  if (!student) throw new AppError('Öğrenci bulunamadı', 404);
  return getMyGraduationStatus(student.userId);
};

export const setGraduationRequirement = async (departmentId, data) => {
  return repo.upsertGraduationRequirement(departmentId, data);
};
