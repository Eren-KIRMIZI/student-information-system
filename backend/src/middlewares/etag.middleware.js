import etag from 'etag';
import { isFeatureEnabled } from '../config/featureFlags.js';

export const etagMiddleware = (req, res, next) => {
  if (!isFeatureEnabled('ETAG_ENABLED')) return next();

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300 && body) {
      const str = typeof body === 'string' ? body : JSON.stringify(body);
      const etagValue = etag(str, { weak: true });
      res.setHeader('ETag', etagValue);

      const ifNoneMatch = req.headers['if-none-match'];
      if (ifNoneMatch && ifNoneMatch === etagValue) {
        res.status(304).end();
        return;
      }
    }
    return originalJson(body);
  };

  next();
};
