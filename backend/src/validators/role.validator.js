import { body, param } from 'express-validator';

export const updateRoleValidator = [
  param('id').isUUID().withMessage('Geçersiz rol ID'),
  body('description').optional().trim().isLength({ max: 500 }),
];
