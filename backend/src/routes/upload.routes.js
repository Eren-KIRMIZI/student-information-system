import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { successResponse } from '../utils/response.util.js';
import { AppError } from '../utils/appError.util.js';
import prisma from '../config/prisma.js';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg','image/png','image/webp','application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.presentationml.presentation'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new AppError('Desteklenmeyen dosya türü', 400), false);
};

const upload = multer({ storage, fileFilter, limits:{ fileSize: 10 * 1024 * 1024 } }); // 10MB

router.post('/', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError('Dosya yüklenmedi', 400));
    const { purpose='OTHER', courseSectionId } = req.body;
    const record = await prisma.upload.create({
      data:{
        uploaderId: req.user.id,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path.replace(/\\/g, '/'),
        purpose,
        courseSectionId: courseSectionId || null,
      },
    });
    return successResponse(res, record, 'Dosya yüklendi', 201);
  } catch (e) { next(e); }
});

// Profile photo upload
router.put('/me/photo', authenticate, upload.single('photo'), async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError('Fotoğraf yüklenmedi', 400));
    const path_ = req.file.path.replace(/\\/g, '/');

    await prisma.upload.create({
      data:{ uploaderId:req.user.id, fileName:req.file.filename, originalName:req.file.originalname, mimeType:req.file.mimetype, size:req.file.size, path:path_, purpose:'PROFILE_PHOTO' },
    });

    // Update profile
    if (req.user.role === 'STUDENT') {
      await prisma.student.updateMany({ where:{userId:req.user.id}, data:{photoUrl:path_} });
    } else if (req.user.role === 'ACADEMICIAN') {
      await prisma.lecturer.updateMany({ where:{userId:req.user.id}, data:{photoUrl:path_} });
    }
    return successResponse(res, { photoUrl: path_ }, 'Profil fotoğrafı güncellendi');
  } catch (e) { next(e); }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const record = await prisma.upload.findUnique({ where:{id:req.params.id} });
    if (!record) return next(new AppError('Dosya bulunamadı', 404));
    if (record.uploaderId !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('Bu dosyayı silme yetkiniz yok', 403));
    }
    await prisma.upload.delete({ where:{id:req.params.id} });
    return successResponse(res, null, 'Dosya silindi');
  } catch (e) { next(e); }
});

export default router;
