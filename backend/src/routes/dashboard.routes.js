import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import * as ctrl from '../controllers/dashboard.controller.js';

const router = Router();

/**
 * @swagger
 * /api/v1/dashboard/student:
 *   get:
 *     tags: [Dashboard]
 *     summary: Öğrenci dashboard verilerini getirme
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Öğrenci dashboard verileri döner
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Yetkiniz yok
 */
router.get('/student', authenticate, authorize('STUDENT'), ctrl.getStudentDashboard);

/**
 * @swagger
 * /api/v1/dashboard/academician:
 *   get:
 *     tags: [Dashboard]
 *     summary: Akademisyen dashboard verilerini getirme
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Akademisyen dashboard verileri döner
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Yetkiniz yok
 */
router.get('/academician', authenticate, authorize('ACADEMICIAN'), ctrl.getAcademicianDashboard);

/**
 * @swagger
 * /api/v1/dashboard/admin:
 *   get:
 *     tags: [Dashboard]
 *     summary: Admin dashboard verilerini getirme
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard verileri döner
 *       401:
 *         description: Yetkilendirme gerekli
 *       403:
 *         description: Yetkiniz yok
 */
router.get('/admin', authenticate, authorize('ADMIN'), ctrl.getAdminDashboard);

export default router;
