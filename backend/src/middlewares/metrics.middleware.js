import { httpRequestsTotal, httpRequestDuration } from '../utils/metrics.js';

/**
 * Her HTTP isteğini Prometheus metriklerine kaydeder.
 * http_requests_total ve http_request_duration_ms güncellenir.
 */
export const metricsMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;

    // Route pattern'i normalize et (/api/v1/students/cuid123 → /api/v1/students/:id)
    const route = normalizeRoute(req.route?.path || req.path);
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    };

    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, durationMs / 1000);
  });

  next();
};

/**
 * URL'deki dinamik segmentleri normalize eder
 * /api/v1/students/clx123abc → /api/v1/students/:id
 */
function normalizeRoute(path) {
  return path
    .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:uuid')
    .replace(/\/c[a-z0-9]{20,30}/gi, '/:id')        // cuid
    .replace(/\/\d+/g, '/:n');                        // numeric
}
