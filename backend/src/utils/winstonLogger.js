import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { getContextValue, getContext } from '../observability/context.js';
import { getActiveTraceId } from '../observability/otel.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = path.join(__dirname, '../../../logs');
const pkgPath = path.join(__dirname, '../../package.json');
const applicationVersion = JSON.parse(fs.readFileSync(pkgPath, 'utf8')).version;

// ==================== FORMATS ====================

// Loglara dinamik context değerlerini (traceId, requestId vb.) ekleyen format
const injectContextFormat = winston.format((info) => {
  const ctx = getContext();
  info.traceId = getActiveTraceId() || ctx.traceId;
  info.requestId = ctx.requestId || info.requestId;
  info.correlationId = ctx.correlationId || info.correlationId;
  info.userId = ctx.userId || info.userId;
  info.role = ctx.role || info.role;
  return info;
});

const jsonFormat = winston.format.combine(
  injectContextFormat(),
  winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  injectContextFormat(),
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, traceId, requestId, ...meta }) => {
    const trace = traceId ? ` [trace:${traceId.slice(0, 8)}]` : '';
    const req   = requestId ? ` [req:${requestId.slice(0, 8)}]` : '';
    const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level}${trace}${req}: ${message}${extra}`;
  })
);

// ==================== TRANSPORTS ====================

const makeRotateTransport = (level, filename) =>
  new DailyRotateFile({
    dirname: LOGS_DIR,
    filename: `%DATE%-${filename}`,
    datePattern: 'YYYY-MM-DD',
    level,
    format: jsonFormat,
    maxSize: '20m',
    maxFiles: '30d',
    zippedArchive: true,
  });

const transports = [
  // Rotating logs — split by type
  makeRotateTransport('error',   'error.log'),
  makeRotateTransport('http',    'http.log'),
  makeRotateTransport('info',    'combined.log'),
];

// Console — dev only
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      level: 'debug',
      format: consoleFormat,
    })
  );
}

// ==================== LOGGER ====================

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  defaultMeta: {
    service: 'obs-api',
    environment: process.env.NODE_ENV || 'development',
    hostname: os.hostname(),
    processId: process.pid,
    applicationVersion,
  },
  transports,
  exitOnError: false,
});

// ==================== AUDIT LOGGER ====================

export const auditLogger = winston.createLogger({
  level: 'info',
  defaultMeta: { service: 'obs-audit' },
  transports: [
    makeRotateTransport('info', 'audit.log'),
  ],
  exitOnError: false,
});

// ==================== CHILD LOGGER HELPER ====================

/**
 * Trace context'i olan child logger oluşturur.
 * @param {{ traceId?: string, requestId?: string, userId?: string }} ctx
 */
export const childLogger = (ctx = {}) => logger.child(ctx);

// ==================== STREAM (morgan compatible) ====================

export const httpLogStream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

export default logger;
