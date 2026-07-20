import { tracer } from '../utils/tracer.js';
import { getCorrelationId } from '../utils/correlation.js';

export const tracingMiddleware = (req, res, next) => {
  const span = tracer.startSpan(`${req.method} ${req.path}`, {
    'http.method': req.method,
    'http.url': req.originalUrl,
    'http.user_agent': req.get('user-agent'),
    correlationId: getCorrelationId(),
  });

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    span.setAttribute('http.status_code', res.statusCode);
    span.end();
    return originalJson(body);
  };

  next();
};
