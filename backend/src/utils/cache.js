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
      let cursor = '0';
      do {
        const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        if (keys.length) await redis.del(...keys);
      } while (cursor !== '0');
    } catch {}
  },
};
