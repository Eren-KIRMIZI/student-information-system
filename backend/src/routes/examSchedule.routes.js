import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import * as ctrl from '../controllers/examSchedule.controller.js';
import { updateExamSlotValidator } from '../validators/examSchedule.validator.js';

const router = Router();

/**
 * @swagger
 * /api/v1/exam-schedule/me:
 *   get:
 *     tags: [Exam Schedule]
 *     summary: Öğrencinin sınav programını getir
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sınav programı başarıyla getirildi
 *       401:
 *         description: Yetkilendirme hatası
 */
router.get('/me', authenticate, ctrl.getMyExamSchedule);

/**
 * @swagger
 * /api/v1/exam-schedule/{id}:
 *   put:
 *     tags: [Exam Schedule]
 *     summary: Sınav zaman dilimini güncelle
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sınav zaman dilimi başarıyla güncellendi
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Sınav zaman dilimi bulunamadı
 */
router.put('/:id', authenticate, authorize('ADMIN'), updateExamSlotValidator, validate, ctrl.updateExamSlot);

/**
 * @swagger
 * /api/v1/exam-schedule/{id}:
 *   delete:
 *     tags: [Exam Schedule]
 *     summary: Sınav zaman dilimini sil
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
 *         description: Sınav zaman dilimi başarıyla silindi
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Sınav zaman dilimi bulunamadı
 */
router.delete('/:id', authenticate, authorize('ADMIN'), ctrl.deleteExamSlot);

export default router;
