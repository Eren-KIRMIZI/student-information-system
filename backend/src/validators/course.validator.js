import { body, param } from 'express-validator';

export const createCourseValidator = [
  body('name').trim().notEmpty().withMessage('Ders adı zorunludur').isLength({ max: 200 }),
  body('code').trim().notEmpty().withMessage('Kod zorunludur').isLength({ max: 20 }),
  body('departmentId').isUUID().withMessage('Bölüm ID zorunludur'),
  body('credits').isInt({ min: 1, max: 10 }).withMessage('Kredi 1-10 arası olmalıdır'),
  body('ects').isInt({ min: 1, max: 30 }).withMessage('AKTS 1-30 arası olmalıdır'),
  body('description').optional().trim(),
];

export const updateCourseValidator = [
  param('id').isUUID().withMessage('Geçersiz ders ID'),
  body('name').optional().trim().notEmpty().isLength({ max: 200 }),
  body('code').optional().trim().notEmpty().isLength({ max: 20 }),
  body('departmentId').optional().isUUID(),
  body('credits').optional().isInt({ min: 1, max: 10 }),
  body('ects').optional().isInt({ min: 1, max: 30 }),
  body('description').optional().trim(),
];
