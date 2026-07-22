import { AppError } from '../utils/appError.util.js';

/**
 * Verilen rollere sahip kullanıcılara erişim izni verir.
 * @param {...string} allowedRoles
 */
export const authorize =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user) return next(new AppError('Kimlik doğrulanmadı', 401));
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Bu işlem için yetkiniz yok', 403));
    }
    next();
  };
