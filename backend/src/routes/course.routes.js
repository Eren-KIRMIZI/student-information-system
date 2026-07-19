import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import * as ctrl from '../controllers/course.controller.js';
import { createCourseValidator, updateCourseValidator } from '../validators/course.validator.js';

const router = Router();

/**
 * @swagger
 * /api/v1/courses/:
 *   get:
 *     tags: [Courses]
 *     summary: Tüm dersleri listeleme
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *         description: Bölüm ID ile filtreleme
 *     responses:
 *       200:
 *         description: Ders listesi döner
 *       401:
 *         description: Yetkilendirme gerekli
 */
router.get('/', authenticate, ctrl.listCourses);

/**
 * @swagger
 * /api/v1/courses/{id}:
 *   get:
 *     tags: [Courses]
 *     summary: Ders detayını getirme
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ders ID
 *     responses:
 *       200:
 *         description: Ders detayı döner
 *       401:
 *         description: Yetkilendirme gerekli
 *       404:
 *         description: Ders bulunamadı
 */
router.get('/:id', authenticate, ctrl.getCourseById);

/**
 * @swagger
 * /api/v1/courses/:
 *   post:
 *     tags: [Courses]
 *     summary: Yeni ders oluşturma (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code, departmentId, credit]
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               departmentId:
 *                 type: string
 *               credit:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ders oluşturuldu
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Yetkiniz yok
 *       409:
 *         description: Ders kodu zaten mevcut
 */
router.post('/', authenticate, authorize('ADMIN'), createCourseValidator, validate, ctrl.createCourse);

/**
 * @swagger
 * /api/v1/courses/{id}:
 *   put:
 *     tags: [Courses]
 *     summary: Ders güncelleme (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ders ID
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
 *               credit:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ders güncellendi
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Yetkiniz yok
 *       404:
 *         description: Ders bulunamadı
 */
router.put('/:id', authenticate, authorize('ADMIN'), updateCourseValidator, validate, ctrl.updateCourse);

/**
 * @swagger
 * /api/v1/courses/{id}:
 *   delete:
 *     tags: [Courses]
 *     summary: Ders silme (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ders ID
 *     responses:
 *       200:
 *         description: Ders silindi
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Yetkiniz yok
 *       404:
 *         description: Ders bulunamadı
 */
router.delete('/:id', authenticate, authorize('ADMIN'), ctrl.deleteCourse);

export default router;
