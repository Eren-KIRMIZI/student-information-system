import { Router } from 'express';
import prisma from '../config/prisma.js';
import redis from '../config/redis.js';
import { getQueueStatus } from '../queue/connection.js';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [System]
 *     summary: Sistem sağlık durumu
 *     description: Veritabanı, Redis ve kuyruk sağlık durumunu döner. Auth gerektirmez.
 *     security: []
 *     responses:
 *       200:
 *         description: Sistem sağlıklı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: UP }
 *                 db:     { type: string, example: UP }
 *                 redis:  { type: string, example: UP }
 *                 queue:  { type: string, example: UP }
 *                 uptime: { type: number, example: 12345 }
 *                 version: { type: string, example: '1.0.0' }
 *                 timestamp: { type: string, example: '2026-07-20T18:00:00Z' }
 *       503:
 *         description: Bir veya daha fazla servis kapalı
 */
router.get('/', async (req, res) => {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkRedis(),
    checkQueue(),
  ]);

  const [dbResult, redisResult, queueResult] = checks;

  const db    = dbResult.status    === 'fulfilled' ? 'UP' : 'DOWN';
  const redisStatus = redisResult.status === 'fulfilled' ? 'UP' : 'DOWN';
  const queue = queueResult.status === 'fulfilled' ? 'UP' : 'DOWN';

  const allUp = db === 'UP' && redisStatus === 'UP' && queue === 'UP';

  const body = {
    status:    allUp ? 'UP' : 'DEGRADED',
    db,
    redis:     redisStatus,
    queue,
    uptime:    Math.floor(process.uptime()),
    version:   process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
    details: {
      db:    dbResult.reason?.message    || null,
      redis: redisResult.reason?.message || null,
      queue: queueResult.reason?.message || null,
    },
  };

  return res.status(allUp ? 200 : 503).json(body);
});

/**
 * @swagger
 * /health/live:
 *   get:
 *     tags: [System]
 *     summary: Kubernetes liveness probe
 *     security: []
 *     responses:
 *       200:
 *         description: Uygulama çalışıyor
 */
router.get('/live', (_req, res) => {
  res.status(200).json({ status: 'UP', uptime: Math.floor(process.uptime()) });
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     tags: [System]
 *     summary: Kubernetes readiness probe
 *     security: []
 *     responses:
 *       200:
 *         description: Uygulama trafik almaya hazır
 *       503:
 *         description: Uygulama henüz hazır değil
 */
router.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'READY' });
  } catch {
    res.status(503).json({ status: 'NOT_READY', reason: 'Database connection failed' });
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
