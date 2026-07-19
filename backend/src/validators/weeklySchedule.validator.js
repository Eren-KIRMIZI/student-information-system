import { body, param } from 'express-validator';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export const createWeeklySlotValidator = [
  body('dayOfWeek').trim().notEmpty().withMessage('Gun zorunludur').isIn(DAYS).withMessage('Geçersiz gun'),
  body('startTime').trim().notEmpty().withMessage('Baslangic saati zorunludur').matches(/^\d{2}:\d{2}$/).withMessage('Saat formati: SS:DD'),
  body('endTime').trim().notEmpty().withMessage('Bitis saati zorunludur').matches(/^\d{2}:\d{2}$/).withMessage('Saat formati: SS:DD'),
  body('classroom').optional().trim().isLength({ max: 50 }),
];

export const updateWeeklySlotValidator = [
  param('id').isUUID().withMessage('Gecersiz slot ID'),
  body('dayOfWeek').optional().trim().isIn(DAYS),
  body('startTime').optional().trim().matches(/^\d{2}:\d{2}$/),
  body('endTime').optional().trim().matches(/^\d{2}:\d{2}$/),
  body('classroom').optional().trim().isLength({ max: 50 }),
];
