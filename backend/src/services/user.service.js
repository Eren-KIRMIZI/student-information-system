import * as repo from '../repositories/user.repository.js';
import { AppError } from '../utils/appError.util.js';
import { logEvent } from '../utils/logger.js';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';

const paginate = (p = 1, l = 20) => ({ skip: (Number(p) - 1) * Number(l), take: Number(l) });

export const getMe = async (userId) => {
  const user = await repo.findById(userId);
  if (!user) throw new AppError('Kullanıcı bulunamadı', 404);
  const { password: _, ...safe } = user;
  return {
    id: safe.id, email: safe.email, role: safe.role.name,
    isActive: safe.isActive, lastLoginAt: safe.lastLoginAt,
    student: safe.student, lecturer: safe.lecturer,
  };
};

export const updateMe = async (userId, data, role) => {
  const { phone, address, email, password } = data;
  if (role === 'STUDENT') {
    await prisma.student.updateMany({ where: { userId }, data: { phone, address } });
  } else if (role === 'ACADEMICIAN') {
    await prisma.lecturer.updateMany({ where: { userId }, data: { phone } });
  }
  if (email) {
    const exists = await prisma.user.findFirst({ where: { email, NOT: { id: userId } } });
    if (exists) throw new AppError('Bu e-posta adresi zaten kullanımda', 409);
    await prisma.user.update({ where: { id: userId }, data: { email } });
  }
  if (password) {
    const hashed = await bcrypt.hash(password, 12);
    await repo.updatePassword(userId, hashed);
  }
  return getMe(userId);
};

export const getUsers = async (query) => {
  const { page = 1, limit = 20, search, roleId, isActive } = query;
  const { skip, take } = paginate(page, limit);
  const where = {};
  if (roleId) where.roleId = roleId;
  if (isActive !== undefined) where.isActive = isActive === 'true';
  if (search) where.OR = [
    { email: { contains: search, mode: 'insensitive' } },
    { student: { firstName: { contains: search, mode: 'insensitive' } } },
    { student: { lastName: { contains: search, mode: 'insensitive' } } },
    { lecturer: { firstName: { contains: search, mode: 'insensitive' } } },
    { lecturer: { lastName: { contains: search, mode: 'insensitive' } } },
  ];
  const [data, total] = await repo.findMany({ skip, take, where });
  const safe = data.map(({ password: _, ...u }) => u);
  return { data: safe, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } };
};

export const createUser = async (data, adminId) => {
  const { email, password, roleId } = data;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new AppError('Bu e-posta adresi zaten kullanımda', 409);
  const hashed = await bcrypt.hash(password, 12);
  const user = await repo.create({ email, password: hashed, roleId });
  await logEvent({ userId: adminId, action: 'USER_CREATED', entity: 'User', entityId: user.id });
  const { password: _, ...safe } = user;
  return safe;
};

export const updateUser = async (id, data) => {
  const user = await repo.update(id, data);
  const { password: _, ...safe } = user;
  return safe;
};

export const updateUserStatus = async (id, isActive, adminId) => {
  await prisma.user.update({ where: { id }, data: { isActive } });
  await logEvent({ userId: adminId, action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED', entity: 'User', entityId: id });
  return null;
};
