import { body, param } from 'express-validator';

const CATEGORIES = ['GENERAL', 'ACADEMIC', 'EXAM', 'EVENT'];
const TARGET_ROLES = ['ALL', 'STUDENT', 'ACADEMICIAN', 'ADMIN'];

export const createAnnouncementValidator = [
  body('title').trim().notEmpty().withMessage('Baslik zorunludur').isLength({ max: 200 }),
  body('content').trim().notEmpty().withMessage('Icerik zorunludur'),
  body('category').optional().trim().isIn(CATEGORIES).withMessage('Gecersiz kategori'),
  body('targetRole').optional().trim().isIn(TARGET_ROLES).withMessage('Gecersiz hedef rol'),
];

export const updateAnnouncementValidator = [
  param('id').isUUID().withMessage('Gecersiz duyuru ID'),
  body('title').optional().trim().notEmpty().isLength({ max: 200 }),
  body('content').optional().trim().notEmpty(),
  body('category').optional().trim().isIn(CATEGORIES),
  body('targetRole').optional().trim().isIn(TARGET_ROLES),
];
