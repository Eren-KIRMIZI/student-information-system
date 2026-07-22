import client from 'prom-client';

export let queueJobsTotal;
export let queueActiveJobsGauge;
export let queueWaitingJobsGauge;
export let queueFailedJobsGauge;

export const initQueueMetrics = (registry) => {
  queueJobsTotal = new client.Counter({
    name: 'queue_jobs_total',
    help: 'Total processed queue jobs',
    labelNames: ['queue_name', 'status'],
    registers: [registry],
  });

  queueActiveJobsGauge = new client.Gauge({
    name: 'queue_active_jobs',
    help: 'Number of active jobs in queue',
    labelNames: ['queue_name'],
    registers: [registry],
  });

  queueWaitingJobsGauge = new client.Gauge({
    name: 'queue_waiting_jobs',
    help: 'Number of waiting jobs in queue',
    labelNames: ['queue_name'],
    registers: [registry],
  });

  queueFailedJobsGauge = new client.Gauge({
    name: 'queue_failed_jobs',
    help: 'Number of failed jobs in queue',
    labelNames: ['queue_name'],
    registers: [registry],
  });
};
