import prisma from '../config/prisma.js';

export const getStudentDashboard = async (studentId) => {
  const [enrollments, grades, upcomingExams, announcements] = await Promise.all([
    prisma.enrollment.findMany({
      where: { studentId, status: { in: ['ACTIVE', 'COMPLETED'] } },
      include: { courseSection: { include: { course: true } } },
    }),
    prisma.grade.findMany({
      where: { enrollment: { studentId }, isFinalized: true },
      include: { enrollment: { include: { courseSection: { include: { course: true } } } } },
    }),
    prisma.examSchedule.findMany({
      where: {
        courseSection: { enrollments: { some: { studentId, status: 'ACTIVE' } } },
        examDate: { gte: new Date() },
      },
      orderBy: { examDate: 'asc' },
      take: 5,
      include: { courseSection: { include: { course: true } } },
    }),
    prisma.announcement.findMany({
      where: { targetRole: { in: ['ALL', 'STUDENT'] } },
      orderBy: { publishedAt: 'desc' },
      take: 5,
      include: { publishedBy: true },
    }),
  ]);

  const totalEcts   = enrollments.reduce((sum, e) => sum + (e.courseSection.course.ects || 0), 0);
  const totalCourses= enrollments.length;

  // GANO
  const finalGrades = grades.filter(g => g.gradePoint !== null);
  let gpa = 0;
  if (finalGrades.length > 0) {
    const totalPoints = finalGrades.reduce((sum, g) => sum + (g.gradePoint * g.enrollment.courseSection.course.credit), 0);
    const totalCredits= finalGrades.reduce((sum, g) => sum + g.enrollment.courseSection.course.credit, 0);
    gpa = totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0;
  }

  return { gpa, totalEcts, totalCourses, upcomingExams, announcements };
};

export const getAcademicianDashboard = async (lecturerId) => {
  const [sections, pendingEnrollments, announcements] = await Promise.all([
    prisma.courseSection.findMany({
      where: { lecturerId },
      include: { enrollments: { where: { status: 'ACTIVE' } }, course: true },
    }),
    prisma.enrollment.count({
      where: {
        status: 'PENDING',
        courseSection: { lecturerId },
      },
    }),
    prisma.announcement.findMany({
      where: { targetRole: { in: ['ALL', 'ACADEMICIAN'] } },
      orderBy: { publishedAt: 'desc' },
      take: 5,
      include: { publishedBy: true },
    }),
  ]);

  const totalSections = sections.length;
  const totalStudents = sections.reduce((sum, s) => sum + s.enrollments.length, 0);

  return { totalSections, totalStudents, pendingEnrollments, sections: sections.map(s => ({ id: s.id, courseName: s.course.name, studentCount: s.enrollments.length })), announcements };
};

export const getAdminDashboard = async () => {
  const [totalStudents, totalLecturers, totalCourses, recentEnrollments, announcements] = await Promise.all([
    prisma.student.count(),
    prisma.lecturer.count(),
    prisma.course.count(),
    prisma.enrollment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { student: true, courseSection: { include: { course: true } } },
    }),
    prisma.announcement.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 5,
      include: { publishedBy: true },
    }),
  ]);

  const totalEnrollments = await prisma.enrollment.count();

  return { totalStudents, totalLecturers, totalCourses, totalEnrollments, recentEnrollments, announcements };
};
