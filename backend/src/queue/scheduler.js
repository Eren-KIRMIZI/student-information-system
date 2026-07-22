import { Queue } from 'bullmq';
import { createQueueConnection } from './connection.js';

const connection = createQueueConnection();

const scheduledQueue = new Queue('scheduled', { connection });

export const setupScheduledJobs = async () => {
  await scheduledQueue.add(
    'cleanup-expired-refresh-tokens',
    {},
    {
      repeat: { cron: '0 3 * * *' },
      jobId: 'cleanup-refresh-tokens',
    },
  );

  await scheduledQueue.add(
    'cleanup-expired-idempotency',
    {},
    {
      repeat: { cron: '0 4 * * *' },
      jobId: 'cleanup-idempotency',
    },
  );

  await scheduledQueue.add(
    'generate-semester-reports',
    {},
    {
      repeat: { cron: '0 6 1 1,5,9 *' },
      jobId: 'semester-reports',
    },
  );

  console.log('[Scheduler] Zamanlanmis isler kaydedildi');
};
