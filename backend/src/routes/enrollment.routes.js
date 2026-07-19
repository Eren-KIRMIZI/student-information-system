import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import * as ctrl from '../controllers/enrollment.controller.js';
import { createEnrollmentValidator } from '../validators/enrollment.validator.js';

const router = Router();

/**
 * @swagger
 * /api/v1/enrollments:
 *   get:
 *     tags: [Enrollments]
 *     summary: Tüm kayıtları listele
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kayıt listesi başarıyla getirildi
 *       401:
 *         description: Yetkilendirme hatası
 */
router.get('/', authenticate, ctrl.listEnrollments);

/**
 * @swagger
 * /api/v1/enrollments/me:
 *   get:
 *     tags: [Enrollments]
 *     summary: Öğrencinin kendi kayıtlarını listele
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Öğrencinin kayıtları başarıyla getirildi
 *       401:
 *         description: Yetkilendirme hatası
 */
router.get('/me', authenticate, authorize('STUDENT'), ctrl.getMyEnrollments);

/**
 * @swagger
 * /api/v1/enrollments:
 *   post:
 *     tags: [Enrollments]
 *     summary: Yeni kayıt oluştur
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - courseId
 *             properties:
 *               studentId:
 *                 type: string
 *               courseId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Kayıt başarıyla oluşturuldu
 *       400:
 *         description: Geçersiz veri
 *       401:
 *         description: Yetkilendirme hatası
 */
router.post('/', authenticate, authorize('STUDENT'), createEnrollmentValidator, validate, ctrl.createEnrollment);

/**
 * @swagger
 * /api/v1/enrollments/{id}/approve:
 *   put:
 *     tags: [Enrollments]
 *     summary: Kaydı onayla
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
 *         description: Kayıt başarıyla onaylandı
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Kayıt bulunamadı
 */
router.put('/:id/approve', authenticate, authorize('ADMIN', 'ACADEMICIAN'), ctrl.approveEnrollment);

/**
 * @swagger
 * /api/v1/enrollments/{id}/reject:
 *   put:
 *     tags: [Enrollments]
 *     summary: Kaydı reddet
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
 *         description: Kayıt başarıyla reddedildi
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Kayıt bulunamadı
 */
router.put('/:id/reject', authenticate, authorize('ADMIN', 'ACADEMICIAN'), ctrl.rejectEnrollment);

/**
 * @swagger
 * /api/v1/enrollments/{id}/drop:
 *   put:
 *     tags: [Enrollments]
 *     summary: Kaydı düşür
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
 *         description: Kayıt başarıyla düşürüldü
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Kayıt bulunamadı
 */
router.put('/:id/drop', authenticate, ctrl.dropEnrollment);

export default router;
