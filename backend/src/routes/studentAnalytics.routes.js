import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import * as ctrl from '../controllers/studentAnalytics.controller.js';

const router = Router();
router.get('/me', authenticate, authorize('STUDENT'), ctrl.getMyAnalytics);

export default router;
