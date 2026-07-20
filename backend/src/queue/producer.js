import { Queue } from 'bullmq';
import { createQueueConnection } from './connection.js';

const connection = createQueueConnection();

export const emailQueue = new Queue('email', { connection, defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 5000 } } });
export const notificationQueue = new Queue('notification', { connection, defaultJobOptions: { attempts: 2 } });
export const reportQueue = new Queue('report', { connection, defaultJobOptions: { attempts: 2, backoff: { type: 'fixed', delay: 10000 } } });
export const cleanupQueue = new Queue('cleanup', { connection, defaultJobOptions: { attempts: 1 } });

export const addEmailJob = (data, opts) => emailQueue.add('send', data, opts);
export const addNotificationJob = (data, opts) => notificationQueue.add('push', data, opts);
export const addReportJob = (data, opts) => reportQueue.add('generate', data, opts);
export const addCleanupJob = (data, opts) => cleanupQueue.add('run', data, opts);
