import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import * as svc from '../services/scheduleOptimizer.service.js';
import { successResponse } from '../utils/response.util.js';

const router = Router();

router.get('/my-schedule', authenticate, authorize('STUDENT'), async (req, res, next) => {
  try {
    return successResponse(res, await svc.getScheduleConflicts(req.user.id));
  } catch (e) {
    next(e);
  }
});

router.get('/available-sections/:courseId', authenticate, authorize('STUDENT'), async (req, res, next) => {
  try {
    return successResponse(res, await svc.getAvailableSections(req.user.id, req.params.courseId));
  } catch (e) {
    next(e);
  }
});

export default router;
