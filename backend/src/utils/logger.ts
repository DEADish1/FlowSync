import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { config } from './config';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  const env = config.nodeEnv;
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : (process.env.LOG_LEVEL || 'info');
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

// JSON format for production
const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Pretty format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

// Build transports array
const transports: winston.transport[] = [];

// Console transport
if (config.nodeEnv !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
} else {
  // Production: JSON to console for log aggregation
  transports.push(
    new winston.transports.Console({
      format: jsonFormat,
    })
  );
}

// File transports with rotation (production)
if (config.nodeEnv === 'production' && process.env.ENABLE_FILE_LOGGING === 'true') {
  const logsDir = process.env.LOGS_DIR || path.join(process.cwd(), 'logs');

  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
      format: jsonFormat,
    })
  );

  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d',
      format: jsonFormat,
    })
  );
}

export const logger = winston.createLogger({
  level: level(),
  levels,
  format: jsonFormat,
  transports,
  exitOnError: false,
});

// Structured logging helpers
export const log = {
  error: (message: string, meta?: Record<string, any>) => logger.error(message, meta),
  warn: (message: string, meta?: Record<string, any>) => logger.warn(message, meta),
  info: (message: string, meta?: Record<string, any>) => logger.info(message, meta),
  http: (message: string, meta?: Record<string, any>) => logger.http(message, meta),
  debug: (message: string, meta?: Record<string, any>) => logger.debug(message, meta),

  request: (method: string, path: string, statusCode: number, duration: number, meta?: Record<string, any>) => {
    logger.http(`${method} ${path} ${statusCode} ${duration}ms`, {
      type: 'request',
      method,
      path,
      statusCode,
      duration,
      ...meta,
    });
  },

  database: (query: string, duration: number, error?: Error) => {
    if (error) {
      logger.error('Database query failed', { type: 'database', query, duration, error: error.message, stack: error.stack });
    } else if (duration > 1000) {
      logger.warn('Slow database query', { type: 'database', query, duration });
    }
  },

  auth: (action: string, userId?: number, success: boolean = true, meta?: Record<string, any>) => {
    logger.info(`Auth: ${action}`, { type: 'auth', action, userId, success, ...meta });
  },

  security: (event: string, severity: 'low' | 'medium' | 'high' | 'critical', meta?: Record<string, any>) => {
    const logLevel = severity === 'critical' || severity === 'high' ? 'error' : 'warn';
    logger[logLevel](`Security: ${event}`, { type: 'security', event, severity, ...meta });
  },
};
