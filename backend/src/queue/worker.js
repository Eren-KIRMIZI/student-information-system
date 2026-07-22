import { Worker } from 'bullmq';
import { createQueueConnection } from './connection.js';
import { logger } from '../utils/winstonLogger.js';
import { queueJobsTotal } from '../utils/metrics.js';
import * as emailService from '../services/email.service.js';

const connection = createQueueConnection();

// ==================== EMAIL WORKER ====================

const emailWorker = new Worker(
  'email',
  async (job) => {
    logger.info(`[Queue:Email] İşleniyor`, { jobId: job.id, type: job.data.type });

    const { type, payload } = job.data;

    switch (type) {
      case 'REGISTRATION_CONFIRMED':
        await emailService.sendRegistrationConfirmed(payload);
        break;

      case 'PASSWORD_CHANGED':
        await emailService.sendPasswordChanged(payload);
        break;

      case 'GRADE_PUBLISHED':
        await emailService.sendGradePublished(payload);
        break;

      case 'ADVISOR_ASSIGNED':
        await emailService.sendAdvisorAssigned(payload);
        break;

      case 'GRADUATION_COMPLETED':
        await emailService.sendGraduationCompleted(payload);
        break;

      case 'QR_ATTENDANCE_ACTIVATED':
        await emailService.sendQRAttendanceActivated(payload);
        break;

      default:
        logger.warn(`[Queue:Email] Bilinmeyen email tipi: ${type}`);
    }

    return { sent: true, type };
  },
  {
    connection,
    concurrency: 5,
    limiter: { max: 100, duration: 60000 }, // 100 email/dakika
  },
);

// ==================== NOTIFICATION WORKER ====================

const notificationWorker = new Worker(
  'notification',
  async (job) => {
    logger.info(`[Queue:Notification] İşleniyor`, { jobId: job.id });
    // Socket.IO gerçek zamanlı bildirim — socket.js'de emit edilir
    return { sent: true };
  },
  { connection, concurrency: 3 },
);

// ==================== REPORT WORKER ====================

const reportWorker = new Worker(
  'report',
  async (job) => {
    logger.info(`[Queue:Report] İşleniyor`, { jobId: job.id, type: job.data.type });
    return { generated: true };
  },
  { connection, concurrency: 1 },
);

// ==================== CLEANUP WORKER ====================

const cleanupWorker = new Worker(
  'cleanup',
  async (job) => {
    logger.info(`[Queue:Cleanup] İşleniyor`, { jobId: job.id });
    return { cleaned: true };
  },
  { connection, concurrency: 1 },
);

// ==================== EVENT HOOKS ====================

const allWorkers = [emailWorker, notificationWorker, reportWorker, cleanupWorker];

allWorkers.forEach((w) => {
  const queueName = w.name;

  w.on('completed', (job) => {
    logger.info(`[Queue] Tamamlandı: ${queueName}#${job.id}`);
    queueJobsTotal.inc({ queue: queueName, status: 'completed' });
  });

  w.on('failed', (job, err) => {
    logger.error(`[Queue] Başarısız: ${queueName}#${job?.id}`, {
      error: err.message,
      queue: queueName,
      jobId: job?.id,
    });
    queueJobsTotal.inc({ queue: queueName, status: 'failed' });
  });

  w.on('active', () => {
    queueJobsTotal.inc({ queue: queueName, status: 'active' });
  });
});

export { emailWorker, notificationWorker, reportWorker, cleanupWorker };
