import prisma from '../config/prisma.js';

// ===== FACULTY =====
export const facultyFindMany = (params) => {
  const { skip=0, take=20, search, sortBy='createdAt', order='desc' } = params;
  const where = search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { code: { contains: search, mode: 'insensitive' } }] } : {};
  return Promise.all([
    prisma.faculty.findMany({ where, skip, take, orderBy: { [sortBy]: order }, include: { _count: { select: { departments: true } } } }),
    prisma.faculty.count({ where }),
  ]);
};
export const facultyFindById   = (id) => prisma.faculty.findUnique({ where: { id }, include: { departments: true } });
export const facultyCreate     = (data) => prisma.faculty.create({ data });
export const facultyUpdate     = (id, data) => prisma.faculty.update({ where: { id }, data });
export const facultyDelete     = (id) => prisma.faculty.delete({ where: { id } });
export const facultyHasDepts   = (id) => prisma.department.count({ where: { facultyId: id } });

// ===== DEPARTMENT =====
export const deptFindMany = (params) => {
  const { skip=0, take=20, search, facultyId, sortBy='createdAt', order='desc' } = params;
  const where = {};
  if (facultyId) where.facultyId = facultyId;
  if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { code: { contains: search, mode: 'insensitive' } }];
  return Promise.all([
    prisma.department.findMany({ where, skip, take, orderBy: { [sortBy]: order }, include: { faculty: true, _count: { select: { students: true, lecturers: true, courses: true } } } }),
    prisma.department.count({ where }),
  ]);
};
export const deptFindById  = (id) => prisma.department.findUnique({ where: { id }, include: { faculty: true } });
export const deptCreate    = (data) => prisma.department.create({ data, include: { faculty: true } });
export const deptUpdate    = (id, data) => prisma.department.update({ where: { id }, data, include: { faculty: true } });
export const deptDelete    = (id) => prisma.department.delete({ where: { id } });
export const deptHasDependents = (id) => Promise.all([
  prisma.student.count({ where: { departmentId: id } }),
  prisma.lecturer.count({ where: { departmentId: id } }),
  prisma.course.count({ where: { departmentId: id } }),
]);

// ===== COURSE =====
export const courseFindMany = (params) => {
  const { skip=0, take=20, search, departmentId, sortBy='createdAt', order='desc' } = params;
  const where = {};
  if (departmentId) where.departmentId = departmentId;
  if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { code: { contains: search, mode: 'insensitive' } }];
  return Promise.all([
    prisma.course.findMany({ where, skip, take, orderBy: { [sortBy]: order }, include: { department: { include: { faculty: true } }, _count: { select: { sections: true } } } }),
    prisma.course.count({ where }),
  ]);
};
export const courseFindById  = (id) => prisma.course.findUnique({ where: { id }, include: { department: { include: { faculty: true } }, sections: { include: { lecturer: true } } } });
export const courseCreate    = (data) => prisma.course.create({ data, include: { department: true } });
export const courseUpdate    = (id, data) => prisma.course.update({ where: { id }, data, include: { department: true } });
export const courseDelete    = (id) => prisma.course.delete({ where: { id } });
export const courseHasSections= (id) => prisma.courseSection.count({ where: { courseId: id, isArchived: false } });

// ===== COURSE SECTION =====
export const sectionFindMany = async (params) => {
  const { skip=0, take=20, academicYear, semester, departmentId, lecturerId, sortBy='createdAt', order='desc' } = params;
  const where = {};
  if (academicYear) where.academicYear = academicYear;
  if (semester) where.semester = semester;
  if (lecturerId) where.lecturerId = lecturerId;
  if (departmentId) where.course = { departmentId };
  const [rows, total] = await Promise.all([
    prisma.courseSection.findMany({ where, skip, take, orderBy: { [sortBy]: order }, include: { course: { include: { department: true } }, lecturer: true, _count: { select: { enrollments: true } } } }),
    prisma.courseSection.count({ where }),
  ]);
  const data = rows.map(s => ({ ...s, remainingQuota: s.quota - s._count.enrollments }));
  return [data, total];
};
export const sectionFindById = async (id) => {
  const s = await prisma.courseSection.findUnique({ where: { id }, include: { course: { include: { department: { include: { faculty: true } } } }, lecturer: true, _count: { select: { enrollments: true } } } });
  if (!s) return null;
  return { ...s, remainingQuota: s.quota - s._count.enrollments };
};
export const sectionCreate   = (data) => prisma.courseSection.create({ data, include: { course: true, lecturer: true } });
export const sectionUpdate   = (id, data) => prisma.courseSection.update({ where: { id }, data, include: { course: true, lecturer: true } });
export const sectionArchive  = (id) => prisma.courseSection.update({ where: { id }, data: { isArchived: true } });
export const sectionDelete   = (id) => prisma.courseSection.delete({ where: { id } });
export const sectionHasEnrollments = (id) => prisma.enrollment.count({ where: { courseSectionId: id, status: { in: ['ACTIVE', 'PENDING'] } } });
