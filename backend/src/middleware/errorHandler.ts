import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

/**
 * Base Application Error
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Specific Error Classes
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, true);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, true);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, true);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, true);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, true);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, true);
  }
}

/**
 * Format Zod validation errors
 */
function formatZodError(error: ZodError): string {
  const errors = error.errors.map((err) => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  });
  return errors.join(', ');
}

/**
 * Error Handler Middleware
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;

  // Handle different error types
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = formatZodError(err);
    isOperational = true;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
    isOperational = true;
  } else if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid or expired token';
    isOperational = true;
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    isOperational = true;
  }

  // Log error
  const errorLog: any = {
    timestamp: new Date().toISOString(),
    requestId: (req as any).id,
    method: req.method,
    path: req.path,
    statusCode,
    message,
    userId: (req as any).user?.id,
    ip: req.ip,
  };

  if (!isOperational) {
    errorLog.stack = err.stack;
  }

  if (statusCode >= 500) {
    logger.error('Server error', errorLog);
  } else {
    logger.warn('Client error', errorLog);
  }

  // Send response
  const response: any = {
    success: false,
    error: {
      message,
      statusCode,
    },
  };

  if ((req as any).id) {
    response.requestId = (req as any).id;
  }

  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

/**
 * 404 Not Found Handler
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  const error = new NotFoundError(`Route ${req.method} ${req.path} not found`);
  next(error);
}

/**
 * Async Route Handler Wrapper
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Graceful Shutdown Handler
 */
export const setupGracefulShutdown = (server: any) => {
  const shutdown = (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);

    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
    if (process.env.NODE_ENV === 'production') {
      shutdown('uncaughtException');
    }
  });

  process.on('unhandledRejection', (reason: any) => {
    logger.error('Unhandled Rejection', { reason: reason?.message || reason, stack: reason?.stack });
    if (process.env.NODE_ENV === 'production') {
      shutdown('unhandledRejection');
    }
  });
};
