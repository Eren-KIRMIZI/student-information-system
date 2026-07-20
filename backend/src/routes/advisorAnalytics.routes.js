import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import * as ctrl from '../controllers/advisorAnalytics.controller.js';

const router = Router();
router.get('/students', authenticate, authorize('ACADEMICIAN'), ctrl.getAdvisorStudents);
router.get('/students/:studentId', authenticate, authorize('ACADEMICIAN'), ctrl.getAdvisorStudentDetail);

export default router;
