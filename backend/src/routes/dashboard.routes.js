import { Router } from 'express';
import * as dashboardService from '../services/dashboard.service.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { successResponse } from '../utils/response.util.js';

const router = Router();

/**
 * @swagger
 * /dashboard/student:
 *   get:
 *     summary: Öğrenci dashboard verisi
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: GPA, AKTS, yaklaşan sınavlar, duyurular
 */
router.get('/student', authenticate, authorize('STUDENT'), async (req, res, next) => {
  try {
    const data = await dashboardService.getStudentDashboard(req.user.id);
    return successResponse(res, data);
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /dashboard/academician:
 *   get:
 *     summary: Akademisyen dashboard verisi
 *     tags: [Dashboard]
 */
router.get('/academician', authenticate, authorize('ACADEMICIAN'), async (req, res, next) => {
  try {
    const data = await dashboardService.getAcademicianDashboard(req.user.id);
    return successResponse(res, data);
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /dashboard/admin:
 *   get:
 *     summary: Admin dashboard verisi
 *     tags: [Dashboard]
 */
router.get('/admin', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const data = await dashboardService.getAdminDashboard();
    return successResponse(res, data);
  } catch (err) { next(err); }
});

export default router;
