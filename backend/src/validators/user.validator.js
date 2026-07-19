import { body, param } from 'express-validator';

export const createUserValidator = [
  body('email').trim().notEmpty().withMessage('E-posta zorunludur').isEmail().withMessage('Geçersiz e-posta adresi'),
  body('password').trim().notEmpty().withMessage('Şifre zorunludur').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır'),
  body('roleId').trim().notEmpty().withMessage('Rol zorunludur'),
];

export const updateUserValidator = [
  param('id').isUUID().withMessage('Geçersiz kullanıcı ID'),
  body('roleId').optional().trim().notEmpty(),
];

export const updateUserStatusValidator = [
  param('id').isUUID().withMessage('Geçersiz kullanıcı ID'),
  body('isActive').isBoolean().withMessage('isActive boolean olmalıdır'),
];

export const updateMeValidator = [
  body('email').optional().trim().isEmail().withMessage('Geçersiz e-posta adresi'),
  body('password').optional().trim().isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır'),
  body('phone').optional().trim().isLength({ max: 20 }),
  body('address').optional().trim().isLength({ max: 500 }),
];
