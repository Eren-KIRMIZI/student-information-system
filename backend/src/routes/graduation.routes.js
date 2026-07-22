import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import * as ctrl from '../controllers/graduation.controller.js';

const router = Router();

router.get('/transcript', authenticate, authorize('STUDENT', 'ACADEMICIAN'), ctrl.getMyTranscript);
router.get(
  '/transcript/student/:studentId',
  authenticate,
  authorize('ADMIN', 'ACADEMICIAN'),
  ctrl.getTranscriptForStudent,
);
router.get('/graduation/my', authenticate, authorize('STUDENT'), ctrl.getMyGraduationStatus);
router.get(
  '/graduation/student/:studentId',
  authenticate,
  authorize('ADMIN', 'ACADEMICIAN'),
  ctrl.checkStudentGraduation,
);
router.put('/graduation/requirement/:departmentId', authenticate, authorize('ADMIN'), ctrl.setGraduationRequirement);

export default router;
