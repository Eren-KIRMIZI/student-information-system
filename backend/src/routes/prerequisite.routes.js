import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { body, param } from 'express-validator';
import * as ctrl from '../controllers/prerequisite.controller.js';

const router = Router();

const createValidator = [
  body('courseId').notEmpty().withMessage('Ders ID gerekli'),
  body('prereqCourseId').notEmpty().withMessage('Ön koşul ders ID gerekli'),
  body('minGradePoint').optional().isFloat({ min: 0, max: 4 }).withMessage('Geçersiz not puanı'),
];

router.get('/', authenticate, ctrl.listPrerequisites);
router.get('/course/:courseId', authenticate, ctrl.getPrerequisitesForCourse);
router.get('/check/:courseId', authenticate, authorize('STUDENT'), ctrl.checkMyPrerequisites);
router.post('/', authenticate, authorize('ADMIN'), createValidator, validate, ctrl.createPrerequisite);
router.delete('/:id', authenticate, authorize('ADMIN'), ctrl.deletePrerequisite);

export default router;
