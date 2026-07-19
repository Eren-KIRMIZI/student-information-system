import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import * as ctrl from '../controllers/advisorAssignment.controller.js';
import { createAdvisorAssignmentValidator } from '../validators/advisorAssignment.validator.js';

const router = Router();

/**
 * @swagger
 * /api/v1/advisor-assignments:
 *   get:
 *     tags: [Advisor Assignments]
 *     summary: Tüm danışman atamalarını listele
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danışman atamaları başarıyla getirildi
 *       401:
 *         description: Yetkilendirme hatası
 */
router.get('/', authenticate, authorize('ADMIN'), ctrl.listAssignments);

/**
 * @swagger
 * /api/v1/advisor-assignments/lecturer/{id}/students:
 *   get:
 *     tags: [Advisor Assignments]
 *     summary: Danışmanın öğrencilerini listele
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Danışman (öğretim üyesi) ID'si
 *     responses:
 *       200:
 *         description: Danışmanın öğrencileri başarıyla getirildi
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Danışman bulunamadı
 */
router.get('/lecturer/:id/students', authenticate, authorize('ADMIN', 'ACADEMICIAN'), ctrl.getAdvisees);

/**
 * @swagger
 * /api/v1/advisor-assignments:
 *   post:
 *     tags: [Advisor Assignments]
 *     summary: Yeni danışman ataması oluştur
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
 *               - lecturerId
 *             properties:
 *               studentId:
 *                 type: string
 *               lecturerId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Danışman ataması başarıyla oluşturuldu
 *       400:
 *         description: Geçersiz veri
 *       401:
 *         description: Yetkilendirme hatası
 */
router.post('/', authenticate, authorize('ADMIN'), createAdvisorAssignmentValidator, validate, ctrl.createAssignment);

/**
 * @swagger
 * /api/v1/advisor-assignments/{id}/deactivate:
 *   put:
 *     tags: [Advisor Assignments]
 *     summary: Danışman atamasını pasifleştir
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
 *         description: Danışman ataması başarıyla pasifleştirildi
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Atama bulunamadı
 */
router.put('/:id/deactivate', authenticate, authorize('ADMIN'), ctrl.deactivateAssignment);

export default router;
