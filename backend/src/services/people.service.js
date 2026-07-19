import * as repo from '../repositories/people.repository.js';
import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';
import { AppError } from '../utils/appError.util.js';

const paginate = (page, limit) => ({ skip: (Number(page) - 1) * Number(limit), take: Number(limit) });

// ===== STUDENT SERVICE =====
export const listStudents = async ({ page = 1, limit = 20, search, departmentId, classYear, sortBy, order }) => {
  const [data, total] = await repo.studentFindMany({ ...paginate(page, limit), search, departmentId, classYear, sortBy, order });
  return { data, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } };
};

export const getStudentById = async (id) => {
  const s = await repo.studentFindById(id);
  if (!s) throw new AppError('Öğrenci bulunamadı', 404);
  return s;
};

export const createStudent = async (data) => {
  const { email, password, firstName, lastName, studentNumber, nationalId, departmentId, classYear, phone, address, birthDate } = data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError('Bu e-posta adresi zaten kullanımda', 409, null, 'DUPLICATE_EMAIL');

  const existingStudent = await prisma.student.findFirst({ where: { studentNumber } });
  if (existingStudent) throw new AppError('Bu öğrenci numarası zaten kullanımda', 409, null, 'DUPLICATE_STUDENT_NUMBER');

  const role = await prisma.role.findUnique({ where: { name: 'STUDENT' } });
  if (!role) throw new AppError('Öğrenci rolü bulunamadı', 500);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email, password: await bcrypt.hash(password, 12), roleId: role.id },
    });
    const student = await tx.student.create({
      data: {
        userId: user.id, firstName, lastName, studentNumber,
        nationalId: nationalId || null, departmentId,
        classYear: Number(classYear) || 1,
        phone: phone || null, address: address || null,
        birthDate: birthDate ? new Date(birthDate) : null,
      },
      include: { department: true, user: { select: { email: true } } },
    });
    return student;
  });
};

export const updateStudent = async (id, data, reqUser) => {
  const student = await repo.studentFindById(id);
  if (!student) throw new AppError('Öğrenci bulunamadı', 404);

  if (reqUser.role === 'STUDENT') {
    const me = await repo.studentFindByUserId(reqUser.id);
    if (me?.id !== id) throw new AppError('Bu kayda erişim yetkiniz yok', 403);
    return repo.studentUpdate(id, { phone: data.phone, address: data.address });
  }

  return repo.studentUpdate(id, data);
};

export const updateStudentStatus = async (id, isActive) => {
  const student = await prisma.student.findUnique({ where: { id }, select: { userId: true } });
  if (!student) throw new AppError('Öğrenci bulunamadı', 404);
  return prisma.user.update({ where: { id: student.userId }, data: { isActive } });
};

// ===== LECTURER SERVICE =====
export const listLecturers = async ({ page = 1, limit = 20, search, departmentId, sortBy, order }) => {
  const [data, total] = await repo.lecturerFindMany({ ...paginate(page, limit), search, departmentId, sortBy, order });
  return { data, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } };
};

export const getLecturerById = async (id) => {
  const l = await repo.lecturerFindById(id);
  if (!l) throw new AppError('Akademisyen bulunamadı', 404);
  return l;
};

export const createLecturer = async (data) => {
  const { email, password, firstName, lastName, title, departmentId, phone } = data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError('Bu e-posta adresi zaten kullanımda', 409, null, 'DUPLICATE_EMAIL');

  const role = await prisma.role.findUnique({ where: { name: 'ACADEMICIAN' } });
  if (!role) throw new AppError('Akademisyen rolü bulunamadı', 500);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email, password: await bcrypt.hash(password, 12), roleId: role.id },
    });
    const lecturer = await tx.lecturer.create({
      data: { userId: user.id, firstName, lastName, title: title || null, departmentId, phone: phone || null },
      include: { department: true, user: { select: { email: true } } },
    });
    return lecturer;
  });
};

export const updateLecturer = async (id, data, reqUser) => {
  const lecturer = await repo.lecturerFindById(id);
  if (!lecturer) throw new AppError('Akademisyen bulunamadı', 404);

  if (reqUser.role === 'ACADEMICIAN') {
    const me = await repo.lecturerFindByUserId(reqUser.id);
    if (me?.id !== id) throw new AppError('Bu kayda erişim yetkiniz yok', 403);
    return repo.lecturerUpdate(id, { phone: data.phone });
  }

  return repo.lecturerUpdate(id, data);
};

export const updateLecturerStatus = async (id, isActive) => {
  const lecturer = await prisma.lecturer.findUnique({ where: { id }, select: { userId: true } });
  if (!lecturer) throw new AppError('Akademisyen bulunamadı', 404);
  return prisma.user.update({ where: { id: lecturer.userId }, data: { isActive } });
};
