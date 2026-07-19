import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import * as ctrl from '../controllers/grade.controller.js';

const router = Router();

/**
 * @swagger
 * /api/v1/grades/me:
 *   get:
 *     tags: [Grades]
 *     summary: Öğrencinin kendi notlarını listele
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Not listesi başarıyla getirildi
 *       401:
 *         description: Yetkilendirme hatası
 */
router.get('/me', authenticate, authorize('STUDENT'), ctrl.getMyGrades);

/**
 * @swagger
 * /api/v1/grades/transcript/me:
 *   get:
 *     tags: [Grades]
 *     summary: Öğrencinin transkriptini getir
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transkript başarıyla getirildi
 *       401:
 *         description: Yetkilendirme hatası
 */
router.get('/transcript/me', authenticate, authorize('STUDENT'), ctrl.getMyTranscript);

/**
 * @swagger
 * /api/v1/grades/transcript/me/pdf:
 *   get:
 *     tags: [Grades]
 *     summary: Öğrencinin transkriptini PDF olarak indir
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: PDF başarıyla oluşturuldu
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Yetkilendirme hatası
 */
router.get('/transcript/me/pdf', authenticate, authorize('STUDENT'), ctrl.getMyTranscriptPDF);

/**
 * @swagger
 * /api/v1/grades/{enrollmentId}:
 *   put:
 *     tags: [Grades]
 *     summary: Notu güncelle
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enrollmentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               grade:
 *                 type: string
 *     responses:
 *       200:
 *         description: Not başarıyla güncellendi
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Kayıt bulunamadı
 */
router.put('/:enrollmentId', authenticate, authorize('ADMIN', 'ACADEMICIAN'), ctrl.updateGrade);

/**
 * @swagger
 * /api/v1/grades/{enrollmentId}/finalize:
 *   put:
 *     tags: [Grades]
 *     summary: Notu kesinleştir
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enrollmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Not başarıyla kesinleştirildi
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Kayıt bulunamadı
 */
router.put('/:enrollmentId/finalize', authenticate, authorize('ADMIN', 'ACADEMICIAN'), ctrl.finalizeGrade);

export default router;
