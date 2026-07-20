import Redis from 'ioredis';

export const createQueueConnection = () => {
  return new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
      if (times > 5) return null;
      return Math.min(times * 300, 3000);
    },
  });
};
