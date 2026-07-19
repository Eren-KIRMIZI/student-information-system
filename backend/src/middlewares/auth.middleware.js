import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError.util.js';

/**
 * Access token'ı doğrular, req.user'ı doldurur.
 */
export const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError('Yetkilendirme başlığı eksik', 401));
  }

  try {
    const payload = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    next();
  } catch {
    return next(new AppError('Access token geçersiz veya süresi dolmuş', 401));
  }
};
