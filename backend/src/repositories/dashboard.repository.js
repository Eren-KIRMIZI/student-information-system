import prisma from '../config/prisma.js';

export const getStudentDashboard = async (studentId, userId) => {
  const [enrollments, grades, upcomingExams, announcements, recentMaterials, unreadMessages] = await Promise.all([
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
    prisma.courseMaterial.findMany({
      where: {
        courseSection: { enrollments: { some: { studentId, status: 'ACTIVE' } } },
        visibility: 'STUDENTS',
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { courseSection: { include: { course: true } } },
    }),
    prisma.message.count({
      where: {
        conversation: { participants: { some: { userId } } },
        senderId: { not: userId },
        isRead: false,
      },
    }),
  ]);

  const totalEcts = enrollments.reduce((sum, e) => sum + (e.courseSection.course.ects || 0), 0);
  const totalCourses = enrollments.length;

  // GANO
  const finalGrades = grades.filter((g) => g.gradePoint !== null);
  let gpa = 0;
  if (finalGrades.length > 0) {
    const totalPoints = finalGrades.reduce(
      (sum, g) => sum + g.gradePoint * g.enrollment.courseSection.course.credit,
      0,
    );
    const totalCredits = finalGrades.reduce((sum, g) => sum + g.enrollment.courseSection.course.credit, 0);
    gpa = totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0;
  }

  return { gpa, totalEcts, totalCourses, upcomingExams, announcements, recentMaterials, unreadMessages };
};

export const getAcademicianDashboard = async (lecturerId, userId) => {
  const [sections, pendingEnrollments, announcements, recentMaterials, materialStats] = await Promise.all([
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
    prisma.courseMaterial.findMany({
      where: { uploaderId: userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { courseSection: { include: { course: true } } },
    }),
    prisma.courseMaterial.aggregate({
      where: { uploaderId: userId },
      _sum: { downloadCount: true },
    }),
  ]);

  const totalSections = sections.length;
  const totalStudents = sections.reduce((sum, s) => sum + s.enrollments.length, 0);
  const totalDownloads = materialStats._sum.downloadCount || 0;

  return {
    totalSections,
    totalStudents,
    pendingEnrollments,
    sections: sections.map((s) => ({ id: s.id, courseName: s.course.name, studentCount: s.enrollments.length })),
    announcements,
    recentMaterials,
    totalDownloads,
  };
};

export const getAdminDashboard = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalStudents,
    totalLecturers,
    totalCourses,
    recentEnrollments,
    announcements,
    totalMaterials,
    materialsToday,
    mostDownloadedMaterials,
  ] = await Promise.all([
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
    prisma.courseMaterial.count(),
    prisma.courseMaterial.count({
      where: { createdAt: { gte: today } },
    }),
    prisma.courseMaterial.findMany({
      orderBy: { downloadCount: 'desc' },
      take: 5,
      include: { uploader: { include: { lecturer: true } }, courseSection: { include: { course: true } } },
    }),
  ]);

  const totalEnrollments = await prisma.enrollment.count();

  return {
    totalStudents,
    totalLecturers,
    totalCourses,
    totalEnrollments,
    recentEnrollments,
    announcements,
    totalMaterials,
    materialsToday,
    mostDownloadedMaterials,
  };
};
