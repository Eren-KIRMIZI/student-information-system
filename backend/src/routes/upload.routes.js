import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { AppError } from '../utils/appError.util.js';
import * as ctrl from '../controllers/upload.controller.js';
import { deleteUploadValidator } from '../validators/upload.validator.js';

const router = Router();

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.docx', '.pptx']);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(new AppError('Desteklenmeyen dosya uzantısı', 400), false);
  }
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new AppError('Desteklenmeyen dosya türü', 400), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const ACADEMICIAN_UPLOAD_PURPOSES = ['COURSE_MATERIAL'];
const ADMIN_UPLOAD_PURPOSES = ['COURSE_MATERIAL', 'ANNOUNCEMENT', 'OTHER'];

const validateUploadPurpose = (req, res, next) => {
  const { purpose } = req.body;
  if (purpose && !['PROFILE_PHOTO', 'COURSE_MATERIAL', 'OTHER'].includes(purpose)) {
    return next(new AppError('Geçersiz yükleme amacı', 400));
  }
  if (purpose === 'COURSE_MATERIAL' && !req.body.courseSectionId) {
    return next(new AppError('Course material için courseSectionId gerekli', 400));
  }
  if (purpose === 'COURSE_MATERIAL' && !['ADMIN', 'ACADEMICIAN'].includes(req.user.role)) {
    return next(new AppError('Course material yükleme yetkiniz yok', 403));
  }
  next();
};

router.post('/', authenticate, upload.single('file'), validateUploadPurpose, ctrl.createUpload);
router.put('/me/photo', authenticate, upload.single('photo'), ctrl.updateProfilePhoto);
router.delete('/:id', authenticate, deleteUploadValidator, validate, ctrl.deleteUpload);

export default router;
