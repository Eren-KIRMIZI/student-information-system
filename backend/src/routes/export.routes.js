import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import * as exportService from '../services/export.service.js';
import { AppError } from '../utils/appError.util.js';

const router = Router();

// Tüm export endpoint'leri admin yetkisi gerektirir
router.use(authenticate, authorize('ADMIN'));

/**
 * @swagger
 * /api/v1/export/students:
 *   get:
 *     tags: [Export]
 *     summary: Tüm öğrencileri Excel olarak indir
 *     description: |
 *       Öğrenci listesini Excel (.xlsx) formatında döner.
 *       Alanlar: Öğrenci No, Ad, Soyad, TC No, Email, Telefon, Fakülte, Bölüm, Sınıf, GPA, Kredi, Doğum Tarihi, Durum
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Excel dosyası
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Yetersiz yetki
 */
router.get('/students', async (req, res, next) => {
  try {
    await exportService.exportStudents(res);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v1/export/grades:
 *   get:
 *     tags: [Export]
 *     summary: Notları Excel olarak indir
 *     parameters:
 *       - in: query
 *         name: academicYear
 *         schema: { type: string }
 *         description: Akademik yıl filtresi (örn. 2025-2026)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Excel dosyası
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/grades', async (req, res, next) => {
  try {
    await exportService.exportGrades(res, { academicYear: req.query.academicYear });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v1/export/attendance:
 *   get:
 *     tags: [Export]
 *     summary: Devamsızlık kayıtlarını Excel olarak indir
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Excel dosyası
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/attendance', async (req, res, next) => {
  try {
    await exportService.exportAttendance(res);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v1/export/transcript/{studentId}:
 *   get:
 *     tags: [Export]
 *     summary: Öğrenci transkriptini Excel olarak indir
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema: { type: string }
 *         description: Öğrenci ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transkript Excel dosyası
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Öğrenci bulunamadı
 */
router.get('/transcript/:studentId', async (req, res, next) => {
  try {
    await exportService.exportTranscript(res, req.params.studentId);
  } catch (err) {
    if (err.message === 'Öğrenci bulunamadı') return next(new AppError(err.message, 404));
    next(err);
  }
});

export default router;
