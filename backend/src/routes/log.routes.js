import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import * as ctrl from '../controllers/log.controller.js';

const router = Router();

/**
 * @swagger
 * /api/v1/logs:
 *   get:
 *     tags: [Logs]
 *     summary: Tüm logları listele
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Log listesi başarıyla getirildi
 *       401:
 *         description: Yetkilendirme hatası
 */
router.get('/', authenticate, authorize('ADMIN'), ctrl.getLogs);

/**
 * @swagger
 * /api/v1/logs/audit:
 *   get:
 *     tags: [Logs]
 *     summary: Audit loglarını listele
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Audit log listesi
 */
router.get('/audit', authenticate, authorize('ADMIN'), ctrl.getAuditLogs);

export default router;
