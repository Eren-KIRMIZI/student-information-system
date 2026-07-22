import client from 'prom-client';

// ==================== REGISTRY ====================
// Tüm metrikleri kaydedeceğimiz merkezi Registry
export const register = new client.Registry();

// Metrikleri toplayıp dönen fonksiyon
export const getMetrics = async () => {
  return await register.metrics();
};

export const metricsContentType = register.contentType;

// Sub-metric modüllerini buraya bağlayacağız
import { initHttpMetrics } from './httpMetrics.js';
import { initProcessMetrics } from './processMetrics.js';
import { initRedisMetrics } from './redisMetrics.js';
import { initPrismaMetrics } from './prismaMetrics.js';
import { initQueueMetrics } from './queueMetrics.js';

let initialized = false;

export const initMetrics = () => {
  if (process.env.MONITORING_ENABLED !== 'true' || initialized) return;
  initialized = true;

  initProcessMetrics(register);
  initHttpMetrics(register);
  initRedisMetrics(register);
  initPrismaMetrics(register);
  initQueueMetrics(register);

  console.log('[Observability] Prometheus metrics initialized.');
};
