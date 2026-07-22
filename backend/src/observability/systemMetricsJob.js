import os from 'os';

/**
 * Admin Dashboard için sistem metriklerini periyodik olarak yayınlar.
 * @param {import('socket.io').Server} io
 */
export const startSystemMetricsJob = (io) => {
  if (process.env.SYSTEM_METRICS_ENABLED !== 'true') return;

  const intervalMs = parseInt(process.env.SYSTEM_METRICS_INTERVAL || '5000', 10);

  setInterval(async () => {
    try {
      const memoryUsage = process.memoryUsage();
      const payload = {
        cpu: os.loadavg(),
        ram: {
          total: os.totalmem(),
          free: os.freemem(),
        },
        heap: {
          total: memoryUsage.heapTotal,
          used: memoryUsage.heapUsed,
        },
        uptime: process.uptime(),
        // TODO: Queue ve request count vb. veriler de buraya eklenebilir.
        timestamp: new Date().toISOString(),
      };

      // Admin Dashboard clientlarına yayinla
      io.emit('system:metrics', payload);
    } catch (err) {
      console.error('[Observability] System metrics job failed', err);
    }
  }, intervalMs);

  console.log(`[Observability] System metrics job started with interval ${intervalMs}ms`);
};
