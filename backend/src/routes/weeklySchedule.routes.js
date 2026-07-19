import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import * as ctrl from '../controllers/weeklySchedule.controller.js';
import { createWeeklySlotValidator, updateWeeklySlotValidator } from '../validators/weeklySchedule.validator.js';

const router = Router();

/**
 * @swagger
 * /api/v1/weekly-schedule/me:
 *   get:
 *     tags: [Weekly Schedule]
 *     summary: Öğrencinin/akademisyenin haftalık programını getir
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Haftalık program başarıyla getirildi
 *       401:
 *         description: Yetkilendirme hatası
 */
router.get('/me', authenticate, authorize('STUDENT', 'ACADEMICIAN'), ctrl.getMyWeeklySchedule);

/**
 * @swagger
 * /api/v1/weekly-schedule/{id}:
 *   put:
 *     tags: [Weekly Schedule]
 *     summary: Haftalık zaman dilimini güncelle
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
 *               day:
 *                 type: string
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               courseId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Zaman dilimi başarıyla güncellendi
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Zaman dilimi bulunamadı
 */
router.put('/:id', authenticate, authorize('ADMIN'), updateWeeklySlotValidator, validate, ctrl.updateWeeklySlot);

/**
 * @swagger
 * /api/v1/weekly-schedule/{id}:
 *   delete:
 *     tags: [Weekly Schedule]
 *     summary: Haftalık zaman dilimini sil
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
 *         description: Zaman dilimi başarıyla silindi
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Zaman dilimi bulunamadı
 */
router.delete('/:id', authenticate, authorize('ADMIN'), ctrl.deleteWeeklySlot);

export default router;
