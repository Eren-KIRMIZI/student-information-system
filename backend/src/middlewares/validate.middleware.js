import { validationResult } from 'express-validator';
import { AppError } from '../utils/appError.util.js';

/**
 * express-validator sonuçlarını kontrol eder.
 * Hata varsa 400 döner; yoksa next() çağırır.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    return next(new AppError('Doğrulama hatası', 400, formattedErrors));
  }
  next();
};
