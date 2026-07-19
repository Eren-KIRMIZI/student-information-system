import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import * as ctrl from '../controllers/lecturer.controller.js';
import { createLecturerValidator, updateLecturerValidator } from '../validators/lecturer.validator.js';

const router = Router();

/**
 * @swagger
 * /api/v1/lecturers/:
 *   get:
 *     tags: [Lecturers]
 *     summary: Tüm akademisyenleri listeleme
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Sayfa numarası
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Sayfa başına kayıt sayısı
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Arama filtresi
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *         description: Bölüm ID ile filtreleme
 *     responses:
 *       200:
 *         description: Akademisyen listesi döner
 *       401:
 *         description: Yetkilendirme gerekli
 */
router.get('/', authenticate, ctrl.listLecturers);

/**
 * @swagger
 * /api/v1/lecturers/{id}:
 *   get:
 *     tags: [Lecturers]
 *     summary: Akademisyen detayını getirme
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Akademisyen ID
 *     responses:
 *       200:
 *         description: Akademisyen detayı döner
 *       401:
 *         description: Yetkilendirme gerekli
 *       404:
 *         description: Akademisyen bulunamadı
 */
router.get('/:id', authenticate, ctrl.getLecturerById);

/**
 * @swagger
 * /api/v1/lecturers/:
 *   post:
 *     tags: [Lecturers]
 *     summary: Yeni akademisyen oluşturma (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, departmentId]
 *             properties:
 *               userId:
 *                 type: string
 *               departmentId:
 *                 type: string
 *               title:
 *                 type: string
 *                 enum: [PROFESSOR, ASSOCIATE_PROFESSOR, ASSISTANT_PROFESSOR, LECTURER]
 *               specialization:
 *                 type: string
 *     responses:
 *       201:
 *         description: Akademisyen oluşturuldu
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Yetkiniz yok
 */
router.post('/', authenticate, authorize('ADMIN'), createLecturerValidator, validate, ctrl.createLecturer);

/**
 * @swagger
 * /api/v1/lecturers/{id}:
 *   put:
 *     tags: [Lecturers]
 *     summary: Akademisyen güncelleme
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Akademisyen ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               departmentId:
 *                 type: string
 *               title:
 *                 type: string
 *                 enum: [PROFESSOR, ASSOCIATE_PROFESSOR, ASSISTANT_PROFESSOR, LECTURER]
 *               specialization:
 *                 type: string
 *     responses:
 *       200:
 *         description: Akademisyen güncellendi
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme gerekli
 *       404:
 *         description: Akademisyen bulunamadı
 */
router.put('/:id', authenticate, updateLecturerValidator, validate, ctrl.updateLecturer);

/**
 * @swagger
 * /api/v1/lecturers/{id}/status:
 *   put:
 *     tags: [Lecturers]
 *     summary: Akademisyen durumunu güncelleme (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Akademisyen ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, ON_LEAVE, RETIRED]
 *     responses:
 *       200:
 *         description: Akademisyen durumu güncellendi
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Yetkiniz yok
 *       404:
 *         description: Akademisyen bulunamadı
 */
router.put('/:id/status', authenticate, authorize('ADMIN'), ctrl.updateLecturerStatus);

export default router;
