import { register, getMetrics, metricsContentType, initMetrics } from '../observability/metrics/index.js';

import {
  httpRequestsTotal,
  httpRequestDurationSeconds as httpRequestDuration,
} from '../observability/metrics/httpMetrics.js';

import {
  redisCacheHitsTotal as redisCacheHits,
  redisCacheMissesTotal as redisCacheMisses,
} from '../observability/metrics/redisMetrics.js';

import { queueJobsTotal } from '../observability/metrics/queueMetrics.js';

import client from 'prom-client';

// Geriye dönük uyumluluk için, eski sayaç ve gauge'leri de burada bağlayalım (Active users vb.)
// Çünkü yeni yapıda bunlar farklı bir isimle olabilir ya da eski sistem bunları kullanıyor olabilir.
export const activeUsersGauge = new client.Gauge({
  name: 'active_users',
  help: 'Number of currently active authenticated users',
  registers: [register],
});

export const socketConnectionsGauge = new client.Gauge({
  name: 'socket_connections',
  help: 'Current number of active Socket.IO connections',
  registers: [register],
});

export const dbQueryDuration = new client.Histogram({
  name: 'db_query_duration_ms',
  help: 'Database query duration in milliseconds (legacy)',
  labelNames: ['model', 'operation'],
  buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000],
  registers: [register],
});

export {
  register,
  getMetrics,
  metricsContentType,
  initMetrics,
  httpRequestsTotal,
  httpRequestDuration,
  redisCacheHits,
  redisCacheMisses,
  queueJobsTotal,
};
