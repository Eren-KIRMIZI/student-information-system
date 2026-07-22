import client from 'prom-client';

export let prismaQueryDurationSeconds;
export let prismaSlowQueriesTotal;
export let dbConnectionPoolStatus;

export const initPrismaMetrics = (registry) => {
  prismaQueryDurationSeconds = new client.Histogram({
    name: 'prisma_query_duration_seconds',
    help: 'Prisma query duration in seconds',
    labelNames: ['model', 'operation'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    registers: [registry],
  });

  prismaSlowQueriesTotal = new client.Counter({
    name: 'prisma_slow_queries_total',
    help: 'Total number of slow Prisma queries',
    labelNames: ['model', 'operation'],
    registers: [registry],
  });

  dbConnectionPoolStatus = new client.Gauge({
    name: 'db_connection_pool_status',
    help: 'Database connection pool active connections',
    registers: [registry],
  });
};
