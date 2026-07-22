import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middlewares/auth.middleware.js';
import * as ctrl from '../controllers/material.controller.js';
import { AppError } from '../utils/appError.util.js';

const router = Router();

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.pdf',
  '.docx',
  '.doc',
  '.pptx',
  '.ppt',
  '.xlsx',
  '.xls',
  '.zip',
]);

const upload = multer({
  dest: 'uploads/temp', // temporary, storage provider will move it
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return cb(new AppError('Desteklenmeyen dosya uzantısı', 400), false);
    }
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(new AppError('Desteklenmeyen dosya türü', 400), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Middleware to ensure temp dir exists
import fs from 'fs';
if (!fs.existsSync('uploads/temp')) {
  fs.mkdirSync('uploads/temp', { recursive: true });
}

router.post('/', authenticate, upload.single('file'), ctrl.createMaterial);
router.get('/section/:sectionId', authenticate, ctrl.getSectionMaterials);
router.get('/:id/download', authenticate, ctrl.downloadMaterial);
router.delete('/:id', authenticate, ctrl.deleteMaterial);

export default router;
