import { Router } from 'express';
import prisma from '../config/prisma.js';
import redis from '../config/redis.js';
import { getQueueStatus } from '../queue/connection.js';

const router = Router();

router.get('/', async (req, res) => {
  const checks = [
    { name: 'postgres', checkFn: checkDatabase },
    { name: 'redis', checkFn: checkRedis },
    { name: 'queue', checkFn: checkQueue },
  ];

  const results = await Promise.all(checks.map(async (c) => {
    const start = Date.now();
    try {
      await c.checkFn();
      return { name: c.name, status: 'UP', responseTime: Date.now() - start };
    } catch (err) {
      return { name: c.name, status: 'DOWN', responseTime: Date.now() - start, reason: err.message };
    }
  }));

  // Memory & Event Loop
  results.push({ name: 'memory', status: 'UP', details: process.memoryUsage() });
  results.push({ name: 'event_loop', status: 'UP' }); // Basic mock or performance.now() check

  const allUp = results.every(r => r.status === 'UP');

  const body = {
    status: allUp ? 'UP' : 'DEGRADED',
    checks: results,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  };

  return res.status(allUp ? 200 : 503).json(body);
});

router.get('/live', (_req, res) => {
  res.status(200).json({ status: 'UP', uptime: Math.floor(process.uptime()) });
});

router.get('/ready', async (_req, res) => {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'UP', checks: [{ name: 'postgres', status: 'UP', responseTime: Date.now() - start }] });
  } catch {
    res.status(503).json({ status: 'DOWN', checks: [{ name: 'postgres', status: 'DOWN' }] });
  }
});

// ==================== CHECKS ====================

async function checkDatabase() {
  await prisma.$queryRaw`SELECT 1`;
}

async function checkRedis() {
  const pong = await redis.ping();
  if (pong !== 'PONG') throw new Error('Redis PING failed');
}

async function checkQueue() {
  await getQueueStatus();
}

export default router;
