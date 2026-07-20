import redis from '../config/redis.js';

const DEFAULT_TTL = 300;

export const cache = {
  async get(key) {
    if (process.env.CACHE_ENABLED !== 'true') return null;
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async set(key, data, ttl = DEFAULT_TTL) {
    if (process.env.CACHE_ENABLED !== 'true') return;
    try {
      await redis.set(key, JSON.stringify(data), 'EX', ttl);
    } catch {}
  },

  async del(key) {
    if (process.env.CACHE_ENABLED !== 'true') return;
    try {
      await redis.del(key);
    } catch {}
  },

  async invalidatePattern(pattern) {
    if (process.env.CACHE_ENABLED !== 'true') return;
    try {
      const keys = await redis.keys(pattern);
      if (keys.length) await redis.del(...keys);
    } catch {}
  },
};
