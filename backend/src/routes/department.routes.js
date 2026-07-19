import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import * as ctrl from '../controllers/department.controller.js';
import { createDepartmentValidator, updateDepartmentValidator } from '../validators/department.validator.js';

const router = Router();

/**
 * @swagger
 * /api/v1/departments/:
 *   get:
 *     tags: [Departments]
 *     summary: Tüm bölümleri listeleme
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: facultyId
 *         schema:
 *           type: string
 *         description: Fakülte ID ile filtreleme
 *     responses:
 *       200:
 *         description: Bölüm listesi döner
 *       401:
 *         description: Yetkilendirme gerekli
 */
router.get('/', authenticate, ctrl.listDepartments);

/**
 * @swagger
 * /api/v1/departments/{id}:
 *   get:
 *     tags: [Departments]
 *     summary: Bölüm detayını getirme
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bölüm ID
 *     responses:
 *       200:
 *         description: Bölüm detayı döner
 *       401:
 *         description: Yetkilendirme gerekli
 *       404:
 *         description: Bölüm bulunamadı
 */
router.get('/:id', authenticate, ctrl.getDepartmentById);

/**
 * @swagger
 * /api/v1/departments/:
 *   post:
 *     tags: [Departments]
 *     summary: Yeni bölüm oluşturma (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code, facultyId]
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               facultyId:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Bölüm oluşturuldu
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Yetkiniz yok
 *       409:
 *         description: Bölüm kodu zaten mevcut
 */
router.post('/', authenticate, authorize('ADMIN'), createDepartmentValidator, validate, ctrl.createDepartment);

/**
 * @swagger
 * /api/v1/departments/{id}:
 *   put:
 *     tags: [Departments]
 *     summary: Bölüm güncelleme (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bölüm ID
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
 *         description: Bölüm güncellendi
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Yetkiniz yok
 *       404:
 *         description: Bölüm bulunamadı
 */
router.put('/:id', authenticate, authorize('ADMIN'), updateDepartmentValidator, validate, ctrl.updateDepartment);

/**
 * @swagger
 * /api/v1/departments/{id}:
 *   delete:
 *     tags: [Departments]
 *     summary: Bölüm silme (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bölüm ID
 *     responses:
 *       200:
 *         description: Bölüm silindi
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Yetkiniz yok
 *       404:
 *         description: Bölüm bulunamadı
 */
router.delete('/:id', authenticate, authorize('ADMIN'), ctrl.deleteDepartment);

export default router;
