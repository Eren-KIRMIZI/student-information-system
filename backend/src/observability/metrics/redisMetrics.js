import client from 'prom-client';

export let redisLatencySeconds;
export let redisCacheHitsTotal;
export let redisCacheMissesTotal;
export let redisConnectionStatus;

export const initRedisMetrics = (registry) => {
  redisLatencySeconds = new client.Histogram({
    name: 'redis_latency_seconds',
    help: 'Redis operation latency in seconds',
    labelNames: ['operation'],
    buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5],
    registers: [registry],
  });

  redisCacheHitsTotal = new client.Counter({
    name: 'redis_cache_hits_total',
    help: 'Total Redis cache hits',
    labelNames: ['cache_name'],
    registers: [registry],
  });

  redisCacheMissesTotal = new client.Counter({
    name: 'redis_cache_misses_total',
    help: 'Total Redis cache misses',
    labelNames: ['cache_name'],
    registers: [registry],
  });

  redisConnectionStatus = new client.Gauge({
    name: 'redis_connection_status',
    help: 'Redis connection status (1 for connected, 0 for disconnected)',
    registers: [registry],
  });
};
