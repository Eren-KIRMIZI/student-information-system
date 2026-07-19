import prisma from '../config/prisma.js';

// ===== STUDENT =====
export const studentFindMany = (params) => {
  const { skip=0, take=20, search, departmentId, classYear, sortBy='createdAt', order='desc' } = params;
  const where = {};
  if (departmentId) where.departmentId = departmentId;
  if (classYear) where.classYear = Number(classYear);
  if (search) where.OR = [
    { firstName: { contains: search, mode: 'insensitive' } },
    { lastName: { contains: search, mode: 'insensitive' } },
    { studentNumber: { contains: search } },
  ];
  return Promise.all([
    prisma.student.findMany({ where, skip, take, orderBy: { [sortBy]: order }, include: { department: { include: { faculty: true } }, user: { select: { email: true, isActive: true, lastLoginAt: true } } } }),
    prisma.student.count({ where }),
  ]);
};
export const studentFindById      = (id) => prisma.student.findUnique({ where: { id }, include: { department: { include: { faculty: true } }, user: { select: { email: true, isActive: true } }, advisorHistory: { include: { lecturer: true }, where: { isActive: true } } } });
export const studentFindByUserId  = (userId) => prisma.student.findUnique({ where: { userId } });
export const studentCreate        = (data) => prisma.student.create({ data, include: { department: true, user: { select: { email: true } } } });
export const studentUpdate        = (id, data) => prisma.student.update({ where: { id }, data, include: { department: true } });
export const studentUpdateStatus  = (id, isActive) => prisma.user.update({ where: { id: (async () => { const s = await prisma.student.findUnique({ where: { id }, select: { userId: true } }); return s.userId; })() }, data: { isActive } });

// ===== LECTURER =====
export const lecturerFindMany    = (params) => {
  const { skip=0, take=20, search, departmentId, sortBy='createdAt', order='desc' } = params;
  const where = {};
  if (departmentId) where.departmentId = departmentId;
  if (search) where.OR = [
    { firstName: { contains: search, mode: 'insensitive' } },
    { lastName: { contains: search, mode: 'insensitive' } },
    { title: { contains: search, mode: 'insensitive' } },
  ];
  return Promise.all([
    prisma.lecturer.findMany({ where, skip, take, orderBy: { [sortBy]: order }, include: { department: { include: { faculty: true } }, user: { select: { email: true, isActive: true, lastLoginAt: true } } } }),
    prisma.lecturer.count({ where }),
  ]);
};
export const lecturerFindById    = (id) => prisma.lecturer.findUnique({ where: { id }, include: { department: { include: { faculty: true } }, user: { select: { email: true, isActive: true } } } });
export const lecturerFindByUserId= (userId) => prisma.lecturer.findUnique({ where: { userId } });
export const lecturerCreate      = (data) => prisma.lecturer.create({ data, include: { department: true, user: { select: { email: true } } } });
export const lecturerUpdate      = (id, data) => prisma.lecturer.update({ where: { id }, data, include: { department: true } });
