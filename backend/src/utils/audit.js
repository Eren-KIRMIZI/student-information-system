import prisma from '../config/prisma.js';
import { getCorrelationId } from '../utils/correlation.js';
import { isFeatureEnabled } from '../config/featureFlags.js';
import { auditLogger } from '../utils/winstonLogger.js';
import { getTraceId, getRequestId } from '../utils/tracer.js';

export const auditLog = async ({
  userId,
  action,
  entity,
  entityId,
  method,
  path,
  ipAddress,
  userAgent,
  before,
  after,
  statusCode,
  durationMs,
}) => {
  if (!isFeatureEnabled('AUDIT_ENABLED')) return;

  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        method,
        path,
        ipAddress,
        userAgent,
        correlationId: getCorrelationId(),
        before: before || undefined,
        after: after || undefined,
        statusCode,
        durationMs,
      },
    });
  } catch (err) {
    console.error('[AUDIT] Audit log kaydedilemedi:', err.message);
  }

  // Ayrıca Winston audit log dosyasına yaz
  auditLogger.info('audit_event', {
    userId,
    action,
    entity,
    entityId,
    method,
    path,
    ipAddress,
    statusCode,
    durationMs,
    traceId: getTraceId(),
    requestId: getRequestId(),
    correlationId: getCorrelationId(),
  });
};

export const auditMiddleware = (req, res, next) => {
  if (!isFeatureEnabled('AUDIT_ENABLED')) return next();

  const start = Date.now();
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    const durationMs = Date.now() - start;
    const userId = req.user?.id || null;

    if (req.method !== 'GET') {
      auditLog({
        userId,
        action: `${req.method} ${req.path}`,
        entity: extractEntity(req.path),
        entityId: extractEntityId(req.path),
        method: req.method,
        path: req.originalUrl,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        statusCode: res.statusCode,
        durationMs,
      }).catch(() => {});
    }

    return originalJson(body);
  };

  next();
};

const extractEntity = (path) => {
  const segments = path.split('/').filter(Boolean);
  const apiIdx = segments.indexOf('v1');
  return apiIdx >= 0 && segments[apiIdx + 1] ? segments[apiIdx + 1] : segments[segments.length - 1] || 'unknown';
};

const extractEntityId = (path) => {
  const segments = path.split('/').filter(Boolean);
  const last = segments[segments.length - 1];
  return last && last.length > 10 ? last : null;
};
