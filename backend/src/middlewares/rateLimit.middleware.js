import { RedisStore } from 'rate-limit-redis';
import { getRedisClient } from '../config/redis.js';
import { isFeatureEnabled } from '../config/featureFlags.js';
import rateLimit from 'express-rate-limit';

const redisClient = getRedisClient();

const createRedisStore = (prefix) => {
  return new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
    prefix: `rl:${prefix}:`,
  });
};

const createLimiter = (windowMs, max, prefix, message) => {
  if (!isFeatureEnabled('RATE_LIMIT_ENABLED')) {
    return (_req, _res, next) => next();
  }
  return rateLimit({
    windowMs,
    max,
    store: createRedisStore(prefix),
    message: {
      success: false,
      message,
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: prefix === 'auth',
  });
};

export const authRateLimiter = createLimiter(
  15 * 60 * 1000,
  process.env.NODE_ENV === 'production' ? 5 : 50,
  'auth',
  'Cok fazla deneme yapildi. Lutfen 15 dakika sonra tekrar deneyin.'
);

export const generalRateLimiter = createLimiter(
  1 * 60 * 1000,
  process.env.NODE_ENV === 'production' ? 60 : 600,
  'general',
  'Istek limiti asildi. Lutfen biraz bekleyin.'
);

export const writeRateLimiter = createLimiter(
  1 * 60 * 1000,
  process.env.NODE_ENV === 'production' ? 30 : 300,
  'write',
  'Yazma istek limiti asildi.'
);
