import { body, param } from 'express-validator';

export const createStudentValidator = [
  body('firstName').trim().notEmpty().withMessage('Ad zorunludur').isLength({ max: 100 }),
  body('lastName').trim().notEmpty().withMessage('Soyad zorunludur').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Geçerli bir e-posta girin').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Şifre en az 8 karakter olmalıdır'),
  body('studentNumber').trim().notEmpty().withMessage('Öğrenci numarası zorunludur').isLength({ max: 20 }),
  body('nationalId').optional().trim().isLength({ max: 11 }),
  body('departmentId').isUUID().withMessage('Bölüm ID zorunludur'),
  body('classYear').optional().isInt({ min: 1, max: 5 }),
  body('phone').optional().trim().isLength({ max: 20 }),
  body('address').optional().trim().isLength({ max: 500 }),
  body('birthDate').optional().isISO8601(),
];

export const updateStudentValidator = [
  param('id').isUUID().withMessage('Geçersiz öğrenci ID'),
  body('firstName').optional().trim().notEmpty().isLength({ max: 100 }),
  body('lastName').optional().trim().notEmpty().isLength({ max: 100 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('studentNumber').optional().trim().notEmpty().isLength({ max: 20 }),
  body('nationalId').optional().trim().isLength({ max: 11 }),
  body('departmentId').optional().isUUID(),
  body('classYear').optional().isInt({ min: 1, max: 5 }),
  body('phone').optional().trim().isLength({ max: 20 }),
  body('address').optional().trim().isLength({ max: 500 }),
  body('birthDate').optional().isISO8601(),
];
