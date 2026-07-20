import { Router } from 'express';
import { getMetrics, metricsContentType } from '../utils/metrics.js';

const router = Router();

/**
 * @swagger
 * /metrics:
 *   get:
 *     tags: [System]
 *     summary: Prometheus metrikleri
 *     description: |
 *       Prometheus format metrikler. Scrape endpoint.
 *       **Örnek metrikler:**
 *       - `http_requests_total` — HTTP istek sayısı (method, route, status)
 *       - `http_request_duration_ms` — İstek süresi histogram
 *       - `active_users` — Aktif kullanıcı sayısı
 *       - `redis_hits_total` / `redis_misses_total` — Redis cache hit/miss
 *       - `queue_jobs_total` — BullMQ iş sayısı (queue, status)
 *       - `socket_connections` — Aktif Socket.IO bağlantıları
 *       - `obs_node_*` — Node.js process metrikleri (heap, CPU, event loop)
 *     security: []
 *     responses:
 *       200:
 *         description: Prometheus format metrikleri
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.get('/', async (_req, res) => {
  try {
    res.set('Content-Type', metricsContentType);
    res.end(await getMetrics());
  } catch (err) {
    res.status(500).json({ error: 'Metrics collection failed', detail: err.message });
  }
});

export default router;
