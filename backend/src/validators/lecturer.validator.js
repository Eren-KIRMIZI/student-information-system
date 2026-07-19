import { body, param } from 'express-validator';

export const createLecturerValidator = [
  body('firstName').trim().notEmpty().withMessage('Ad zorunludur').isLength({ max: 100 }),
  body('lastName').trim().notEmpty().withMessage('Soyad zorunludur').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Geçerli bir e-posta girin').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Şifre en az 8 karakter olmalıdır'),
  body('departmentId').isUUID().withMessage('Bölüm ID zorunludur'),
  body('title').optional().trim().isLength({ max: 50 }),
  body('phone').optional().trim().isLength({ max: 20 }),
];

export const updateLecturerValidator = [
  param('id').isUUID().withMessage('Geçersiz akademisyen ID'),
  body('firstName').optional().trim().notEmpty().isLength({ max: 100 }),
  body('lastName').optional().trim().notEmpty().isLength({ max: 100 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('departmentId').optional().isUUID(),
  body('title').optional().trim().isLength({ max: 50 }),
  body('phone').optional().trim().isLength({ max: 20 }),
];
