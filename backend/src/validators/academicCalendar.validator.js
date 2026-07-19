import { body, param } from 'express-validator';

const CALENDAR_CATEGORIES = ['REGISTRATION', 'EXAM', 'HOLIDAY', 'SEMESTER_START', 'SEMESTER_END', 'OTHER'];

export const createCalendarEventValidator = [
  body('title').trim().notEmpty().withMessage('Baslik zorunludur').isLength({ max: 200 }),
  body('startDate').trim().notEmpty().withMessage('Baslangic tarihi zorunludur').isISO8601().withMessage('Gecersiz tarih'),
  body('endDate').trim().notEmpty().withMessage('Bitis tarihi zorunludur').isISO8601().withMessage('Gecersiz tarih'),
  body('category').optional().trim().isIn(CALENDAR_CATEGORIES).withMessage('Gecersiz kategori'),
  body('description').optional().trim().isLength({ max: 500 }),
];

export const updateCalendarEventValidator = [
  param('id').isUUID().withMessage('Gecersiz etkinlik ID'),
  body('title').optional().trim().notEmpty().isLength({ max: 200 }),
  body('startDate').optional().trim().isISO8601(),
  body('endDate').optional().trim().isISO8601(),
  body('category').optional().trim().isIn(CALENDAR_CATEGORIES),
  body('description').optional().trim().isLength({ max: 500 }),
];
