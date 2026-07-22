import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import * as ctrl from '../controllers/user.controller.js';
import {
  createUserValidator,
  updateUserValidator,
  updateUserStatusValidator,
  updateMeValidator,
} from '../validators/user.validator.js';

const router = Router();

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     tags: [Users]
 *     summary: Mevcut kullanıcı bilgilerini getirme
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı bilgileri döner
 *       401:
 *         description: Yetkilendirme gerekli
 */
router.get('/me', authenticate, ctrl.getMe);

/**
 * @swagger
 * /api/v1/users/me:
 *   put:
 *     tags: [Users]
 *     summary: Mevcut kullanıcı bilgilerini güncelleme
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Kullanıcı bilgileri güncellendi
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme gerekli
 */
router.put('/me', authenticate, updateMeValidator, validate, ctrl.updateMe);

/**
 * @swagger
 * /api/v1/users/:
 *   get:
 *     tags: [Users]
 *     summary: Tüm kullanıcıları listeleme (admin)
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
 *         name: role
 *         schema:
 *           type: string
 *         description: Rol filtresi
 *     responses:
 *       200:
 *         description: Kullanıcı listesi döner
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Yetkiniz yok
 */
router.get('/', authenticate, authorize('ADMIN'), ctrl.getUsers);

/**
 * @swagger
 * /api/v1/users/:
 *   post:
 *     tags: [Users]
 *     summary: Yeni kullanıcı oluşturma (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName, role]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [STUDENT, ACADEMICIAN, ADMIN]
 *     responses:
 *       201:
 *         description: Kullanıcı oluşturuldu
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Yetkiniz yok
 *       409:
 *         description: E-posta zaten kayıtlı
 */
router.post('/', authenticate, authorize('ADMIN'), createUserValidator, validate, ctrl.createUser);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Kullanıcı güncelleme (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kullanıcı ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [STUDENT, ACADEMICIAN, ADMIN]
 *     responses:
 *       200:
 *         description: Kullanıcı güncellendi
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Yetkiniz yok
 *       404:
 *         description: Kullanıcı bulunamadı
 */
router.put('/:id', authenticate, authorize('ADMIN'), updateUserValidator, validate, ctrl.updateUser);

/**
 * @swagger
 * /api/v1/users/{id}/status:
 *   put:
 *     tags: [Users]
 *     summary: Kullanıcı durumunu güncelleme (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kullanıcı ID
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
 *                 enum: [ACTIVE, INACTIVE, SUSPENDED]
 *     responses:
 *       200:
 *         description: Kullanıcı durumu güncellendi
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Yetkiniz yok
 *       404:
 *         description: Kullanıcı bulunamadı
 */
router.put('/:id/status', authenticate, authorize('ADMIN'), updateUserStatusValidator, validate, ctrl.updateUserStatus);

export default router;
