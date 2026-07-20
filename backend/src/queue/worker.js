import { Worker } from 'bullmq';
import { createQueueConnection } from './connection.js';

const connection = createQueueConnection();

const emailWorker = new Worker('email', async (job) => {
  console.log(`[Queue:Email] Isleniyor: ${job.id}`, job.data);
  return { sent: true };
}, { connection, concurrency: 5 });

const notificationWorker = new Worker('notification', async (job) => {
  console.log(`[Queue:Notification] Isleniyor: ${job.id}`, job.data);
  return { sent: true };
}, { connection, concurrency: 3 });

const reportWorker = new Worker('report', async (job) => {
  console.log(`[Queue:Report] Isleniyor: ${job.id}`, job.data);
  return { generated: true };
}, { connection, concurrency: 1 });

const cleanupWorker = new Worker('cleanup', async (job) => {
  console.log(`[Queue:Cleanup] Isleniyor: ${job.id}`, job.data);
  return { cleaned: true };
}, { connection, concurrency: 1 });

[emailWorker, notificationWorker, reportWorker, cleanupWorker].forEach((w) => {
  w.on('completed', (job) => console.log(`[Queue] Tamamlandi: ${job.queueName}#${job.id}`));
  w.on('failed', (job, err) => console.error(`[Queue] Basarisiz: ${job?.queueName}#${job?.id}`, err.message));
});

export { emailWorker, notificationWorker, reportWorker, cleanupWorker };
