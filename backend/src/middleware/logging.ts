import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { monitoringService } from '../services/monitoringService';

// Extend Express Request to include custom properties
declare global {
  namespace Express {
    interface Request {
      id?: string;
      startTime?: number;
    }
  }
}

/**
 * Request ID Middleware
 * Assigns a unique ID to each request for tracking
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.id = req.headers['x-request-id'] as string || uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
};

/**
 * Request Logging Middleware
 * Logs incoming requests and tracks metrics
 */
export const requestLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.startTime = Date.now();

  // Log request start
  if (process.env.NODE_ENV !== 'production' || process.env.LOG_LEVEL === 'debug') {
    console.log(`[${req.id}] ${req.method} ${req.path} - Started`);
  }

  // Capture original res.json and res.send to log response
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  res.json = function (body: any) {
    logResponse(req, res);
    return originalJson(body);
  };

  res.send = function (body: any) {
    logResponse(req, res);
    return originalSend(body);
  };

  // Handle stream responses and other edge cases
  res.on('finish', () => {
    if (!res.headersSent) {
      return;
    }
    logResponse(req, res);
  });

  next();
};

/**
 * Log response and track metrics
 */
function logResponse(req: Request, res: Response) {
  if (!req.startTime) return;

  const duration = (Date.now() - req.startTime) / 1000; // Convert to seconds
  const statusCode = res.statusCode;
  const method = req.method;
  const route = getRoutePattern(req);

  // Track metrics
  monitoringService.trackHttpRequest(method, route, statusCode, duration);

  // Log response
  const logLevel = statusCode >= 500 ? 'ERROR' : statusCode >= 400 ? 'WARN' : 'INFO';
  const logMessage = `[${req.id}] ${method} ${req.path} - ${statusCode} - ${duration.toFixed(3)}s`;

  if (process.env.NODE_ENV === 'production') {
    // In production, only log errors and warnings by default
    if (logLevel === 'ERROR' || logLevel === 'WARN' || process.env.LOG_LEVEL === 'debug') {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: logLevel,
        requestId: req.id,
        method,
        path: req.path,
        route,
        statusCode,
        duration: `${duration.toFixed(3)}s`,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        userId: (req as any).user?.id,
      }));
    }
  } else {
    // In development, log all requests
    console.log(`${logLevel}: ${logMessage}`);
  }
}

/**
 * Extract route pattern from request
 * Tries to get the Express route pattern instead of the actual path
 */
function getRoutePattern(req: Request): string {
  if (req.route) {
    return req.route.path;
  }

  // Fallback: normalize dynamic segments in path
  return req.path
    .replace(/\/\d+/g, '/:id')
    .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:uuid');
}

/**
 * Error Logging Middleware
 * Must be added after all routes
 */
export const errorLoggingMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const method = req.method;
  const route = getRoutePattern(req);
  const errorType = err.name || 'UnknownError';

  // Track error metric
  monitoringService.trackHttpError(method, route, errorType);

  // Log error
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    requestId: req.id,
    method,
    path: req.path,
    route,
    error: {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    userId: (req as any).user?.id,
  }));

  next(err);
};

/**
 * Performance Warning Middleware
 * Warns about slow requests
 */
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const slowRequestThreshold = parseInt(process.env.SLOW_REQUEST_THRESHOLD_MS || '5000');

  res.on('finish', () => {
    if (!req.startTime) return;

    const duration = Date.now() - req.startTime;
    if (duration > slowRequestThreshold) {
      console.warn(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'WARN',
        type: 'SLOW_REQUEST',
        requestId: req.id,
        method: req.method,
        path: req.path,
        duration: `${duration}ms`,
        threshold: `${slowRequestThreshold}ms`,
      }));
    }
  });

  next();
};
