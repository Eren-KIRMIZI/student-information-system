import prisma from '../config/prisma.js';

export const searchRepository = {
  async searchStudents(query, take = 10) {
    return prisma.student.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { studentNumber: { contains: query, mode: 'insensitive' } },
          { nationalId: { contains: query, mode: 'insensitive' } },
        ],
      },
      take,
      include: { department: { select: { name: true } } },
    });
  },

  async searchLecturers(query, take = 10) {
    return prisma.lecturer.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { title: { contains: query, mode: 'insensitive' } },
        ],
      },
      take,
      include: { department: { select: { name: true } } },
    });
  },

  async searchCourses(query, take = 10) {
    return prisma.course.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { code: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take,
      include: { department: { select: { name: true } } },
    });
  },

  async searchDepartments(query, take = 10) {
    return prisma.department.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { code: { contains: query, mode: 'insensitive' } },
        ],
      },
      take,
      include: { faculty: { select: { name: true } } },
    });
  },

  async searchAnnouncements(query, take = 10) {
    return prisma.announcement.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
      take,
      orderBy: { publishedAt: 'desc' },
      include: { publishedBy: { select: { email: true } } },
    });
  },

  async searchAll(query, take = 5) {
    const [students, lecturers, courses, departments, announcements] = await Promise.all([
      this.searchStudents(query, take),
      this.searchLecturers(query, take),
      this.searchCourses(query, take),
      this.searchDepartments(query, take),
      this.searchAnnouncements(query, take),
    ]);

    return { students, lecturers, courses, departments, announcements };
  },
};
