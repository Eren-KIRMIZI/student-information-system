import { body, param } from 'express-validator';

const EXAM_TYPES = ['MIDTERM', 'FINAL', 'MAKEUP'];

export const createExamSlotValidator = [
  body('examType').trim().notEmpty().withMessage('Sinav türü zorunludur').isIn(EXAM_TYPES).withMessage('Geçersiz sinav türü'),
  body('examDate').trim().notEmpty().withMessage('Sinav tarihi zorunludur').isISO8601().withMessage('Geçersiz tarih'),
  body('startTime').trim().notEmpty().withMessage('Baslangic saati zorunludur').matches(/^\d{2}:\d{2}$/).withMessage('Saat formati: SS:DD'),
  body('endTime').trim().notEmpty().withMessage('Bitis saati zorunludur').matches(/^\d{2}:\d{2}$/).withMessage('Saat formati: SS:DD'),
  body('classroom').trim().notEmpty().withMessage('Derslik zorunludur').isLength({ max: 50 }),
  body('supervisorId').optional({ nullable: true }),
];

export const updateExamSlotValidator = [
  param('id').isUUID().withMessage('Gecersiz slot ID'),
  body('examType').optional().trim().isIn(EXAM_TYPES),
  body('examDate').optional().trim().isISO8601(),
  body('startTime').optional().trim().matches(/^\d{2}:\d{2}$/),
  body('endTime').optional().trim().matches(/^\d{2}:\d{2}$/),
  body('classroom').optional().trim().isLength({ max: 50 }),
  body('supervisorId').optional({ nullable: true }),
];
