import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import * as ctrl from '../controllers/attendance.controller.js';

const router = Router();

/**
 * @swagger
 * /api/v1/attendance/me:
 *   get:
 *     tags: [Attendance]
 *     summary: Öğrencinin kendi devam kaydını getir
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Devam kaydı başarıyla getirildi
 *       401:
 *         description: Yetkilendirme hatası
 */
router.get('/me', authenticate, authorize('STUDENT'), ctrl.getMyAttendance);

export default router;
