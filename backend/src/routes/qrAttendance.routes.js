import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { body } from 'express-validator';
import { validate } from '../middlewares/validate.middleware.js';
import * as ctrl from '../controllers/qrAttendance.controller.js';

const router = Router();

router.post(
  '/generate',
  authenticate,
  authorize('ACADEMICIAN'),
  [body('courseSectionId').notEmpty()],
  validate,
  ctrl.generateQRToken,
);
router.get('/active/:courseSectionId', authenticate, authorize('ACADEMICIAN'), ctrl.getQRToken);
router.post(
  '/scan',
  authenticate,
  authorize('STUDENT'),
  [body('token').notEmpty().withMessage('QR token gerekli')],
  validate,
  ctrl.scanQRToken,
);
router.put('/:id/deactivate', authenticate, authorize('ACADEMICIAN'), ctrl.deactivateQRToken);
router.get('/section/:courseSectionId', authenticate, authorize('ACADEMICIAN'), ctrl.getSectionScans);
router.get('/recent/:courseSectionId', authenticate, authorize('ACADEMICIAN'), ctrl.getRecentScans);

export default router;
