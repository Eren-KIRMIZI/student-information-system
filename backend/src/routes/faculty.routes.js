import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import * as ctrl from '../controllers/faculty.controller.js';
import { createFacultyValidator, updateFacultyValidator } from '../validators/faculty.validator.js';

const router = Router();

/**
 * @swagger
 * /api/v1/faculties/:
 *   get:
 *     tags: [Faculties]
 *     summary: Tüm fakülteleri listeleme
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fakülte listesi döner
 *       401:
 *         description: Yetkilendirme gerekli
 */
router.get('/', authenticate, ctrl.listFaculties);

/**
 * @swagger
 * /api/v1/faculties/{id}:
 *   get:
 *     tags: [Faculties]
 *     summary: Fakülte detayını getirme
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Fakülte ID
 *     responses:
 *       200:
 *         description: Fakülte detayı döner
 *       401:
 *         description: Yetkilendirme gerekli
 *       404:
 *         description: Fakülte bulunamadı
 */
router.get('/:id', authenticate, ctrl.getFacultyById);

/**
 * @swagger
 * /api/v1/faculties/:
 *   post:
 *     tags: [Faculties]
 *     summary: Yeni fakülte oluşturma (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code]
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Fakülte oluşturuldu
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Yetkiniz yok
 *       409:
 *         description: Fakülte kodu zaten mevcut
 */
router.post('/', authenticate, authorize('ADMIN'), createFacultyValidator, validate, ctrl.createFaculty);

/**
 * @swagger
 * /api/v1/faculties/{id}:
 *   put:
 *     tags: [Faculties]
 *     summary: Fakülte güncelleme (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Fakülte ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Fakülte güncellendi
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Yetkiniz yok
 *       404:
 *         description: Fakülte bulunamadı
 */
router.put('/:id', authenticate, authorize('ADMIN'), updateFacultyValidator, validate, ctrl.updateFaculty);

/**
 * @swagger
 * /api/v1/faculties/{id}:
 *   delete:
 *     tags: [Faculties]
 *     summary: Fakülte silme (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Fakülte ID
 *     responses:
 *       200:
 *         description: Fakülte silindi
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Yetkiniz yok
 *       404:
 *         description: Fakülte bulunamadı
 */
router.delete('/:id', authenticate, authorize('ADMIN'), ctrl.deleteFaculty);

export default router;
