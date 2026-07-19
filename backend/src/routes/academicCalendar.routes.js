import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import * as ctrl from '../controllers/academicCalendar.controller.js';
import { createCalendarEventValidator, updateCalendarEventValidator } from '../validators/academicCalendar.validator.js';

const router = Router();

/**
 * @swagger
 * /api/v1/academic-calendar:
 *   get:
 *     tags: [Academic Calendar]
 *     summary: Tüm akademik takvim olaylarını listele
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Akademik takvim olayları başarıyla getirildi
 *       401:
 *         description: Yetkilendirme hatası
 */
router.get('/', authenticate, ctrl.getCalendarEvents);

/**
 * @swagger
 * /api/v1/academic-calendar/{id}:
 *   get:
 *     tags: [Academic Calendar]
 *     summary: Akademik takvim olayını ID ile getir
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
 *         description: Akademik takvim olayı başarıyla getirildi
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Olay bulunamadı
 */
router.get('/:id', authenticate, ctrl.getCalendarEventById);

/**
 * @swagger
 * /api/v1/academic-calendar:
 *   post:
 *     tags: [Academic Calendar]
 *     summary: Yeni akademik takvim olayı oluştur
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - startDate
 *               - endDate
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               type:
 *                 type: string
 *     responses:
 *       201:
 *         description: Akademik takvim olayı başarıyla oluşturuldu
 *       400:
 *         description: Geçersiz veri
 *       401:
 *         description: Yetkilendirme hatası
 */
router.post('/', authenticate, authorize('ADMIN'), createCalendarEventValidator, validate, ctrl.createCalendarEvent);

/**
 * @swagger
 * /api/v1/academic-calendar/{id}:
 *   put:
 *     tags: [Academic Calendar]
 *     summary: Akademik takvim olayını güncelle
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Akademik takvim olayı başarıyla güncellendi
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Olay bulunamadı
 */
router.put('/:id', authenticate, authorize('ADMIN'), updateCalendarEventValidator, validate, ctrl.updateCalendarEvent);

/**
 * @swagger
 * /api/v1/academic-calendar/{id}:
 *   delete:
 *     tags: [Academic Calendar]
 *     summary: Akademik takvim olayını sil
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
 *         description: Akademik takvim olayı başarıyla silindi
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Olay bulunamadı
 */
router.delete('/:id', authenticate, authorize('ADMIN'), ctrl.deleteCalendarEvent);

export default router;
