import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { AppError } from '../utils/appError.util.js';
import * as ctrl from '../controllers/upload.controller.js';
import { deleteUploadValidator } from '../validators/upload.validator.js';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new AppError('Desteklenmeyen dosya türü', 400), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

/**
 * @swagger
 * /api/v1/uploads:
 *   post:
 *     tags: [Uploads]
 *     summary: Dosya yükle
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Dosya başarıyla yüklendi
 *       400:
 *         description: Desteklenmeyen dosya türü
 *       401:
 *         description: Yetkilendirme hatası
 */
router.post('/', authenticate, upload.single('file'), ctrl.createUpload);

/**
 * @swagger
 * /api/v1/uploads/me/photo:
 *   put:
 *     tags: [Uploads]
 *     summary: Profil fotoğrafını güncelle
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - photo
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profil fotoğrafı başarıyla güncellendi
 *       400:
 *         description: Desteklenmeyen dosya türü
 *       401:
 *         description: Yetkilendirme hatası
 */
router.put('/me/photo', authenticate, upload.single('photo'), ctrl.updateProfilePhoto);

/**
 * @swagger
 * /api/v1/uploads/{id}:
 *   delete:
 *     tags: [Uploads]
 *     summary: Dosyayı sil
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dosya başarıyla silindi
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Dosya bulunamadı
 */
router.delete('/:id', authenticate, deleteUploadValidator, validate, ctrl.deleteUpload);

export default router;
