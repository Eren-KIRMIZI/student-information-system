import { randomUUID } from 'crypto';
import { logger } from './winstonLogger.js';
import {
  getContextValue,
  runWithContext as runWithSharedContext,
  getContext as getSharedContext,
} from '../observability/context.js';

// ==================== CONTEXT API ====================

export const getContext = () => getSharedContext() || {};

export const getTraceId = () => getContextValue('traceId') || null;
export const getRequestId = () => getContextValue('requestId') || null;

export const runWithContext = (ctx, fn) => runWithSharedContext(ctx, fn);

// ==================== TRACER ====================

export const tracer = {
  /**
   * Yeni bir trace context başlatır (HTTP middleware'de çağrılır)
   */
  startTrace(requestId) {
    return {
      traceId: randomUUID(),
      requestId: requestId || randomUUID(),
      startTime: Date.now(),
      spans: [],
    };
  },

  /**
   * Mevcut context içinde bir span açar.
   * Tüm zincir (Controller → Service → Repository → Prisma → Redis)
   * aynı traceId'yi taşır.
   *
   * @param {string} name — "UserService.findById" gibi
   * @param {object} attributes
   * @returns {{ end, addEvent, setAttribute }}
   */
  startSpan(name, attributes = {}) {
    const ctx = getContext();
    if (!ctx || Object.keys(ctx).length === 0) {
      // Trace context yok — no-op span
      return {
        end: () => null,
        addEvent: () => null,
        setAttribute: () => null,
      };
    }

    const spanId = randomUUID().slice(0, 8);
    const startTime = Date.now();

    const span = {
      traceId: ctx.traceId,
      requestId: ctx.requestId,
      spanId,
      name,
      attributes: { ...attributes },
      events: [],
      startTime,
    };

    return {
      end(extraAttrs = {}) {
        span.endTime = Date.now();
        span.durationMs = span.endTime - span.startTime;
        Object.assign(span.attributes, extraAttrs);

        if (ctx.spans) ctx.spans.push(span);

        logger.debug(`[span] ${span.name}`, {
          traceId: span.traceId,
          requestId: span.requestId,
          spanId: span.spanId,
          durationMs: span.durationMs,
          ...span.attributes,
        });

        return span;
      },

      addEvent(eventName, eventAttrs = {}) {
        span.events.push({ name: eventName, attributes: eventAttrs, timestamp: Date.now() });
      },

      setAttribute(key, value) {
        span.attributes[key] = value;
      },
    };
  },

  /**
   * Tüm trace'i loglar (request tamamlandığında)
   */
  endTrace(ctx, statusCode) {
    const durationMs = Date.now() - ctx.startTime;

    logger.info('[trace] Request completed', {
      traceId: ctx.traceId,
      requestId: ctx.requestId,
      userId: ctx.userId,
      durationMs,
      statusCode,
      spanCount: ctx.spans?.length || 0,
    });
  },
};
