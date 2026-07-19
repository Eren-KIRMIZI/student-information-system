import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import * as ctrl from '../controllers/announcement.controller.js';
import { createAnnouncementValidator, updateAnnouncementValidator } from '../validators/announcement.validator.js';

const router = Router();

/**
 * @swagger
 * /api/v1/announcements:
 *   get:
 *     tags: [Announcements]
 *     summary: Tüm duyuruları listele
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Duyuru listesi başarıyla getirildi
 *       401:
 *         description: Yetkilendirme hatası
 */
router.get('/', authenticate, ctrl.getAnnouncements);

/**
 * @swagger
 * /api/v1/announcements/{id}:
 *   get:
 *     tags: [Announcements]
 *     summary: Duyuruyu ID ile getir
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
 *         description: Duyuru başarıyla getirildi
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Duyuru bulunamadı
 */
router.get('/:id', authenticate, ctrl.getAnnouncementById);

/**
 * @swagger
 * /api/v1/announcements:
 *   post:
 *     tags: [Announcements]
 *     summary: Yeni duyuru oluştur
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
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               targetRoles:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Duyuru başarıyla oluşturuldu
 *       400:
 *         description: Geçersiz veri
 *       401:
 *         description: Yetkilendirme hatası
 */
router.post('/', authenticate, authorize('ADMIN'), createAnnouncementValidator, validate, ctrl.createAnnouncement);

/**
 * @swagger
 * /api/v1/announcements/{id}:
 *   put:
 *     tags: [Announcements]
 *     summary: Duyuruyu güncelle
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
 *               content:
 *                 type: string
 *               targetRoles:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Duyuru başarıyla güncellendi
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Duyuru bulunamadı
 */
router.put('/:id', authenticate, authorize('ADMIN'), updateAnnouncementValidator, validate, ctrl.updateAnnouncement);

/**
 * @swagger
 * /api/v1/announcements/{id}:
 *   delete:
 *     tags: [Announcements]
 *     summary: Duyuruyu sil
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
 *         description: Duyuru başarıyla silindi
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Duyuru bulunamadı
 */
router.delete('/:id', authenticate, authorize('ADMIN'), ctrl.deleteAnnouncement);

export default router;
