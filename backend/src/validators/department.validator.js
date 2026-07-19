import { body, param } from 'express-validator';

export const createDepartmentValidator = [
  body('name').trim().notEmpty().withMessage('Bölüm adı zorunludur').isLength({ max: 200 }),
  body('code').trim().notEmpty().withMessage('Kod zorunludur').isLength({ max: 20 }),
  body('facultyId').isUUID().withMessage('Fakülte ID zorunludur'),
];

export const updateDepartmentValidator = [
  param('id').isUUID().withMessage('Geçersiz bölüm ID'),
  body('name').optional().trim().notEmpty().isLength({ max: 200 }),
  body('code').optional().trim().notEmpty().isLength({ max: 20 }),
  body('facultyId').optional().isUUID(),
];
