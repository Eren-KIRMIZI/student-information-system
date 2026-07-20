import { isFeatureEnabled } from '../config/featureFlags.js';
import { AppError } from '../utils/appError.util.js';

export const maintenanceCheck = (req, res, next) => {
  if (!isFeatureEnabled('MAINTENANCE_MODE')) return next();
  if (req.path.includes('/auth/login') || req.path.includes('/auth/refresh')) return next();
  return next(new AppError('Sistem bakim asamasindadir, lutfen daha sonra tekrar deneyin', 503));
};
