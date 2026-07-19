import { body } from 'express-validator';

export const createAdvisorAssignmentValidator = [
  body('studentId').isUUID().withMessage('Öğrenci ID zorunludur'),
  body('lecturerId').isUUID().withMessage('Akademisyen ID zorunludur'),
  body('academicYear').optional().trim().notEmpty(),
];
