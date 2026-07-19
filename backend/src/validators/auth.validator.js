import { body } from 'express-validator';

export const loginValidator = [
  body('email').isEmail().withMessage('Geçerli bir e-posta adresi giriniz').normalizeEmail(),
  body('password').notEmpty().withMessage('Şifre zorunludur'),
];

export const forgotPasswordValidator = [
  body('email').isEmail().withMessage('Geçerli bir e-posta adresi giriniz').normalizeEmail(),
];

export const resetPasswordValidator = [
  body('token').notEmpty().withMessage('Token zorunludur'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('Şifre en az 8 karakter olmalı')
    .matches(/[A-Z]/).withMessage('En az bir büyük harf içermeli')
    .matches(/[0-9]/).withMessage('En az bir rakam içermeli'),
];

export const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Mevcut şifre zorunludur'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('Şifre en az 8 karakter olmalı')
    .matches(/[A-Z]/).withMessage('En az bir büyük harf içermeli')
    .matches(/[0-9]/).withMessage('En az bir rakam içermeli'),
];
