import { body } from 'express-validator';

export const createEnrollmentValidator = [
  body('courseSectionId').isUUID().withMessage('Ders şubesi ID zorunludur'),
];
