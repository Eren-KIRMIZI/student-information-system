import prisma from '../config/prisma.js';
import { AppError } from '../utils/appError.util.js';
import { storage } from './storage/index.js';
import { getIO } from '../config/socket.js';
import { auditLog } from '../utils/audit.js';

export const createMaterial = async (file, data, user) => {
  if (!file) throw new AppError('Dosya yüklenmedi', 400);

  const { title, description, week, visibility, courseSectionId } = data;

  // Check permissions: Admin or Academician assigned to this section
  if (user.role === 'ACADEMICIAN') {
    const section = await prisma.courseSection.findFirst({
      where: { id: courseSectionId, lecturerId: user.lecturer?.id },
    });
    if (!section) throw new AppError('Bu şubeye materyal yükleme yetkiniz yok', 403);
  } else if (user.role !== 'ADMIN') {
    throw new AppError('Materyal yükleme yetkiniz yok', 403);
  }

  // Upload to storage
  const storageResult = await storage.upload(file, 'COURSE_MATERIAL');

  const material = await prisma.courseMaterial.create({
    data: {
      title,
      description,
      week: week ? parseInt(week) : null,
      visibility: visibility || 'STUDENTS',
      originalFileName: storageResult.originalFileName,
      storageKey: storageResult.storageKey,
      fileUrl: storageResult.fileUrl,
      fileType: storageResult.fileType,
      extension: storageResult.extension,
      fileSize: storageResult.fileSize,
      uploaderId: user.id,
      courseSectionId,
    },
    include: { uploader: { select: { id: true, email: true } } },
  });

  // Socket notification to enrolled students
  getIO().to(`coursesection:${courseSectionId}`).emit('material:new', material);

  // Audit log
  await auditLog({
    userId: user.id,
    action: 'CREATE',
    entity: 'CourseMaterial',
    entityId: material.id,
    method: 'POST',
    path: '/api/v1/materials',
    after: material,
  });

  return material;
};

export const getSectionMaterials = async (courseSectionId, user) => {
  // Access check
  if (user.role === 'STUDENT') {
    const enrollment = await prisma.enrollment.findFirst({
      where: { courseSectionId, studentId: user.student?.id },
    });
    if (!enrollment) throw new AppError('Bu dersin materyallerini göremezsiniz', 403);
  }

  return prisma.courseMaterial.findMany({
    where: {
      courseSectionId,
      ...(user.role === 'STUDENT' ? { visibility: 'STUDENTS' } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      uploader: { select: { id: true, email: true, lecturer: { select: { firstName: true, lastName: true } } } },
    },
  });
};

export const incrementDownload = async (id, user) => {
  const material = await prisma.courseMaterial.update({
    where: { id },
    data: { downloadCount: { increment: 1 } },
  });

  await auditLog({
    userId: user.id,
    action: 'DOWNLOAD',
    entity: 'CourseMaterial',
    entityId: material.id,
    method: 'GET',
    path: `/api/v1/materials/${id}/download`,
  });

  return material;
};

export const deleteMaterial = async (id, user) => {
  const material = await prisma.courseMaterial.findUnique({ where: { id } });
  if (!material) throw new AppError('Materyal bulunamadı', 404);

  if (user.role === 'ACADEMICIAN') {
    if (material.uploaderId !== user.id) {
      throw new AppError('Sadece kendi yüklediğiniz materyali silebilirsiniz', 403);
    }
  } else if (user.role !== 'ADMIN') {
    throw new AppError('Silme yetkiniz yok', 403);
  }

  await storage.delete(material.storageKey);
  await prisma.courseMaterial.delete({ where: { id } });

  await auditLog({
    userId: user.id,
    action: 'DELETE',
    entity: 'CourseMaterial',
    entityId: id,
    method: 'DELETE',
    path: `/api/v1/materials/${id}`,
  });

  return true;
};
