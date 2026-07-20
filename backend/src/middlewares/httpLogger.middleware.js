import morgan from 'morgan';
import { logger } from '../utils/winstonLogger.js';
import { getTraceId, getRequestId } from '../utils/tracer.js';

/**
 * Morgan formatını Winston'a yönlendiren HTTP logger.
 * Her isteği: method, url, status, duration, user_id, trace_id ile loglar.
 */

// Custom token'lar
morgan.token('trace-id',   () => getTraceId()   || '-');
morgan.token('request-id', () => getRequestId() || '-');
morgan.token('user-id',    (req) => req.user?.id || '-');
morgan.token('body-size',  (req) => {
  const len = req.headers['content-length'];
  return len ? `${len}B` : '-';
});

const FORMAT = ':method :url :status :res[content-length]B :response-time ms | trace=:trace-id req=:request-id user=:user-id';

export const httpLogger = morgan(FORMAT, {
  stream: {
    write(message) {
      logger.http(message.trim(), {
        traceId:   getTraceId(),
        requestId: getRequestId(),
      });
    },
  },
  skip(req) {
    // Health check ve metrics'i loglamaktan kaçın
    return req.url === '/health' || req.url === '/metrics' || req.url === '/health/live';
  },
});
