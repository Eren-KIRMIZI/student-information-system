import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import * as ctrl from '../controllers/student.controller.js';
import { createStudentValidator, updateStudentValidator } from '../validators/student.validator.js';

const router = Router();

/**
 * @swagger
 * /api/v1/students/:
 *   get:
 *     tags: [Students]
 *     summary: Tüm öğrencileri listeleme
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
 *         description: Öğrenci listesi döner
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Yetkiniz yok
 */
router.get('/', authenticate, authorize('ADMIN', 'ACADEMICIAN'), ctrl.listStudents);

/**
 * @swagger
 * /api/v1/students/{id}:
 *   get:
 *     tags: [Students]
 *     summary: Öğrenci detayını getirme
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Öğrenci ID
 *     responses:
 *       200:
 *         description: Öğrenci detayı döner
 *       401:
 *         description: Yetkilendirme gerekli
 *       404:
 *         description: Öğrenci bulunamadı
 */
router.get('/:id', authenticate, ctrl.getStudentById);

/**
 * @swagger
 * /api/v1/students/:
 *   post:
 *     tags: [Students]
 *     summary: Yeni öğrenci oluşturma (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, studentNumber, departmentId]
 *             properties:
 *               userId:
 *                 type: string
 *               studentNumber:
 *                 type: string
 *               departmentId:
 *                 type: string
 *               enrollmentYear:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Öğrenci oluşturuldu
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Yetkiniz yok
 *       409:
 *         description: Öğrenci numarası zaten mevcut
 */
router.post('/', authenticate, authorize('ADMIN'), createStudentValidator, validate, ctrl.createStudent);

/**
 * @swagger
 * /api/v1/students/{id}:
 *   put:
 *     tags: [Students]
 *     summary: Öğrenci güncelleme
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Öğrenci ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentNumber:
 *                 type: string
 *               departmentId:
 *                 type: string
 *               enrollmentYear:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Öğrenci güncellendi
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme gerekli
 *       404:
 *         description: Öğrenci bulunamadı
 */
router.put('/:id', authenticate, updateStudentValidator, validate, ctrl.updateStudent);

/**
 * @swagger
 * /api/v1/students/{id}/status:
 *   put:
 *     tags: [Students]
 *     summary: Öğrenci durumunu güncelleme (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Öğrenci ID
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
 *                 enum: [ACTIVE, INACTIVE, GRADUATED, SUSPENDED]
 *     responses:
 *       200:
 *         description: Öğrenci durumu güncellendi
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Yetkiniz yok
 *       404:
 *         description: Öğrenci bulunamadı
 */
router.put('/:id/status', authenticate, authorize('ADMIN'), ctrl.updateStudentStatus);

export default router;
