import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 3) return null;
    return Math.min(times * 200, 2000);
  },
  lazyConnect: true,
});

redis.on('error', (err) => {
  console.error('[Redis] Baglanti hatasi:', err.message);
});

redis.on('connect', () => {
  console.log('[Redis] Baglandi');
});

export default redis;
export const getRedisClient = () => redis;
