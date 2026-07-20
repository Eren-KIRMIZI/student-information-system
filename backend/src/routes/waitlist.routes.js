import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { body, param } from 'express-validator';
import { validate } from '../middlewares/validate.middleware.js';
import * as ctrl from '../controllers/waitlist.controller.js';

const router = Router();

router.post('/', authenticate, authorize('STUDENT'), [body('courseSectionId').notEmpty()], validate, ctrl.joinWaitlist);
router.delete('/:courseSectionId', authenticate, authorize('STUDENT'), ctrl.cancelWaitlist);
router.get('/me', authenticate, authorize('STUDENT'), ctrl.getMyWaitlist);
router.get('/section/:courseSectionId', authenticate, authorize('ADMIN', 'ACADEMIAN'), ctrl.getWaitlistForSection);
router.post('/:id/promote', authenticate, authorize('ADMIN', 'ACADEMIAN'), ctrl.promoteFromWaitlist);

export default router;
