import morgan from 'morgan';
import { logger } from '../utils/winstonLogger.js';

/**
 * Morgan formatını Winston'a yönlendiren HTTP logger.
 * Her isteği: method, url, status, duration, ip, userAgent vb. ile loglar.
 * Request context'inden gelen traceId vb. veriler winstonLogger içinde otomatik eklenir.
 */

const FORMAT = JSON.stringify({
  method: ':method',
  endpoint: ':url',
  statusCode: ':status',
  responseTime: ':response-time',
  ip: ':remote-addr',
  userAgent: ':user-agent',
});

export const httpLogger = morgan(FORMAT, {
  stream: {
    write(message) {
      try {
        const data = JSON.parse(message.trim());
        // Sayıları dönüştür
        if (data.statusCode) data.statusCode = parseInt(data.statusCode, 10);
        if (data.responseTime) data.responseTime = parseFloat(data.responseTime);

        logger.http(`HTTP ${data.method} ${data.endpoint}`, data);
      } catch (e) {
        logger.http(message.trim());
      }
    },
  },
  skip(req) {
    // Health check ve metrics'i loglamaktan kaçın
    return req.url === '/health' || req.url === '/metrics' || req.url === '/health/live' || req.url === '/health/ready';
  },
});
