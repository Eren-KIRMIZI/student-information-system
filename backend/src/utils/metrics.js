import client from 'prom-client';

// ==================== REGISTRY ====================

const register = new client.Registry();

// Default Node.js process metrics (heap, CPU, event loop lag, etc.)
client.collectDefaultMetrics({
  register,
  prefix: 'obs_node_',
  labels: { service: 'obs-api', env: process.env.NODE_ENV || 'development' },
});

// ==================== CUSTOM METRICS ====================

// HTTP Request Counter — { method, route, status }
export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

// HTTP Request Duration — histogram (ms)
export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'HTTP request duration in milliseconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [5, 10, 25, 50, 100, 200, 500, 1000, 2500, 5000],
  registers: [register],
});

// Active Users (authenticated connections)
export const activeUsersGauge = new client.Gauge({
  name: 'active_users',
  help: 'Number of currently active authenticated users',
  registers: [register],
});

// Redis Cache Hits / Misses
export const redisCacheHits = new client.Counter({
  name: 'redis_hits_total',
  help: 'Total Redis cache hits',
  registers: [register],
});

export const redisCacheMisses = new client.Counter({
  name: 'redis_misses_total',
  help: 'Total Redis cache misses',
  registers: [register],
});

// BullMQ Queue Jobs — { queue, status: completed|failed|active }
export const queueJobsTotal = new client.Counter({
  name: 'queue_jobs_total',
  help: 'Total BullMQ queue jobs processed',
  labelNames: ['queue', 'status'],
  registers: [register],
});

// Socket.IO active connections
export const socketConnectionsGauge = new client.Gauge({
  name: 'socket_connections',
  help: 'Current number of active Socket.IO connections',
  registers: [register],
});

// Database query duration (for key Prisma operations)
export const dbQueryDuration = new client.Histogram({
  name: 'db_query_duration_ms',
  help: 'Database query duration in milliseconds',
  labelNames: ['model', 'operation'],
  buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000],
  registers: [register],
});

// ==================== EXPORTS ====================

export { register };

export const metricsContentType = register.contentType;

export const getMetrics = () => register.metrics();
