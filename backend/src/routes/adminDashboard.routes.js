import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import * as ctrl from '../controllers/adminDashboard.controller.js';

const router = Router();
router.get('/kpis', authenticate, authorize('ADMIN'), ctrl.getAdminKPIs);

export default router;
