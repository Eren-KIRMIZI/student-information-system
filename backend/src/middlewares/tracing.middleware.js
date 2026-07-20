import { tracer, runWithContext } from '../utils/tracer.js';
import { logger } from '../utils/winstonLogger.js';

/**
 * Her HTTP request'e:
 * 1. Unique trace_id atar
 * 2. AsyncLocalStorage context başlatır
 * 3. Controller → Service → Repository → Prisma → Redis zinciri boyunca aynı trace_id taşır
 * 4. Request tamamlandığında tam trace log'u yazar
 */
export const tracingMiddleware = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || req.id || null;
  const ctx = tracer.startTrace(requestId);

  // Trace ID'yi response header'a ekle
  res.setHeader('X-Trace-ID',   ctx.traceId);
  res.setHeader('X-Request-ID', ctx.requestId);

  // Context'i request'e bağla (auth middleware userId'yi sonradan doldurur)
  req.traceCtx = ctx;

  // Request başlangıç span'i
  const rootSpan = {
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('user-agent') || '-',
    ip: req.ip,
  };

  logger.debug('[trace] Request started', {
    traceId:   ctx.traceId,
    requestId: ctx.requestId,
    ...rootSpan,
  });

  // Response hook — trace'i kapat
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (req.user?.id) ctx.userId = req.user.id;
    tracer.endTrace(ctx, res.statusCode);
    return originalJson(body);
  };

  // AsyncLocalStorage context içinde devam et
  runWithContext(ctx, () => next());
};
