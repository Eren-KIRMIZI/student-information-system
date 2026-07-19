import { body, param } from 'express-validator';

export const createFacultyValidator = [
  body('name').trim().notEmpty().withMessage('Fakülte adı zorunludur').isLength({ max: 200 }),
  body('code').trim().notEmpty().withMessage('Kod zorunludur').isLength({ max: 20 }),
];

export const updateFacultyValidator = [
  param('id').isUUID().withMessage('Geçersiz fakülte ID'),
  body('name').optional().trim().notEmpty().isLength({ max: 200 }),
  body('code').optional().trim().notEmpty().isLength({ max: 20 }),
];
