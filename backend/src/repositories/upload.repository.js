import prisma from '../config/prisma.js';

export const uploadCreate = (data) => prisma.upload.create({ data });

export const uploadFindById = (id) => prisma.upload.findUnique({ where: { id } });

export const uploadDelete = (id) => prisma.upload.delete({ where: { id } });

export const studentUpdatePhoto = (userId, photoUrl) =>
  prisma.student.updateMany({ where: { userId }, data: { photoUrl } });

export const lecturerUpdatePhoto = (userId, photoUrl) =>
  prisma.lecturer.updateMany({ where: { userId }, data: { photoUrl } });
