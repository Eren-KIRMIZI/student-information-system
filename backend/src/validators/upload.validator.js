import { body, param } from 'express-validator';

export const deleteUploadValidator = [param('id').isUUID().withMessage('Geçersiz dosya ID')];
