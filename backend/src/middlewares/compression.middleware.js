import compression from 'compression';
import { isFeatureEnabled } from '../config/featureFlags.js';

export const compress = compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.path.startsWith('/api-docs')) return false;
    return compression.filter(req, res);
  },
});

export const compressionMiddleware = (req, res, next) => {
  if (!isFeatureEnabled('COMPRESSION_ENABLED')) return next();
  return compress(req, res, next);
};
