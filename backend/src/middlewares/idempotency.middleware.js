import crypto from 'crypto';
import prisma from '../config/prisma.js';
import { isFeatureEnabled } from '../config/featureFlags.js';

export const idempotencyMiddleware = async (req, res, next) => {
  if (!isFeatureEnabled('IDEMPOTENCY_ENABLED')) return next();
  if (req.method === 'GET' || req.method === 'DELETE') return next();

  const idempotencyKey = req.headers['idempotency-key'];
  if (!idempotencyKey) return next();

  const userId = req.user?.id || 'anonymous';
  const hash = crypto.createHash('sha256').update(`${userId}:${req.originalUrl}:${idempotencyKey}`).digest('hex');

  try {
    const existing = await prisma.idempotencyRecord.findUnique({ where: { key: hash } });
    if (existing && existing.expiresAt > new Date()) {
      res.status(existing.statusCode).json(existing.response);
      return;
    }
  } catch {
    return next();
  }

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    const statusCode = res.statusCode;

    prisma.idempotencyRecord
      .create({
        data: {
          key: hash,
          statusCode,
          response: body,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      })
      .catch(() => {});

    return originalJson(body);
  };

  next();
};
