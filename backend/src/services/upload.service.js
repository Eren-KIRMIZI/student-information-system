import * as repo from '../repositories/upload.repository.js';
import { AppError } from '../utils/appError.util.js';
import fs from 'fs';
import path from 'path';

const sanitizeFilename = (name) => {
  const base = path.basename(name);
  return base.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200);
};

export const createUpload = async (file, userId, purpose = 'OTHER', courseSectionId = null) => {
  if (!file) throw new AppError('Dosya yüklenmedi', 400);
  return repo.uploadCreate({
    uploaderId: userId,
    fileName: file.filename,
    originalName: sanitizeFilename(file.originalname),
    mimeType: file.mimetype,
    size: file.size,
    path: file.path.replace(/\\/g, '/'),
    purpose,
    courseSectionId: courseSectionId || null,
  });
};

export const updateProfilePhoto = async (file, userId, role) => {
  if (!file) throw new AppError('Fotoğraf yüklenedi', 400);
  const photoUrl = file.path.replace(/\\/g, '/');
  await repo.uploadCreate({
    uploaderId: userId,
    fileName: file.filename,
    originalName: sanitizeFilename(file.originalname),
    mimeType: file.mimetype,
    size: file.size,
    path: photoUrl,
    purpose: 'PROFILE_PHOTO',
  });
  if (role === 'STUDENT') {
    await repo.studentUpdatePhoto(userId, photoUrl);
  } else if (role === 'ACADEMICIAN') {
    await repo.lecturerUpdatePhoto(userId, photoUrl);
  }
  return { photoUrl };
};

export const deleteUpload = async (id, userId, userRole) => {
  const record = await repo.uploadFindById(id);
  if (!record) throw new AppError('Dosya bulunamadı', 404);
  if (record.uploaderId !== userId && userRole !== 'ADMIN') {
    throw new AppError('Bu dosyayı silme yetkiniz yok', 403);
  }
  try {
    const filePath = path.resolve(record.path);
    if (filePath.startsWith(path.resolve('uploads'))) {
      fs.unlinkSync(filePath);
    }
  } catch {}
  return repo.uploadDelete(id);
};
