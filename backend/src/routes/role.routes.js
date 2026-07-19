import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import * as ctrl from '../controllers/role.controller.js';
import { updateRoleValidator } from '../validators/role.validator.js';

const router = Router();

/**
 * @swagger
 * /api/v1/roles:
 *   get:
 *     tags: [Roles]
 *     summary: Tüm rolleri listele
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rol listesi başarıyla getirildi
 *       401:
 *         description: Yetkilendirme hatası
 */
router.get('/', authenticate, authorize('ADMIN'), ctrl.getRoles);

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   put:
 *     tags: [Roles]
 *     summary: Rolü güncelle
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
 *               name:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Rol başarıyla güncellendi
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Rol bulunamadı
 */
router.put('/:id', authenticate, authorize('ADMIN'), updateRoleValidator, validate, ctrl.updateRole);

export default router;
