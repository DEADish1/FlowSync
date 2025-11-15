import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '../utils/redis';
import { config } from '../utils/config';

/**
 * Global rate limiter for all API requests
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.nodeEnv === 'production' ? 100 : 1000, // 100 requests per 15 minutes in production
  standardHeaders: true,
  legacyHeaders: false,
  store: config.nodeEnv === 'production' ? new RedisStore({
    client: redisClient,
    prefix: 'rl:global:',
  }) : undefined,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later.',
    },
  },
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === '/health';
  },
});

/**
 * Strict rate limiter for authentication endpoints
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.nodeEnv === 'production' ? 5 : 50, // 5 login attempts per 15 minutes in production
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  store: config.nodeEnv === 'production' ? new RedisStore({
    client: redisClient,
    prefix: 'rl:auth:',
  }) : undefined,
  message: {
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later.',
    },
  },
});

/**
 * Rate limiter for AI endpoints (more restrictive due to cost)
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: config.nodeEnv === 'production' ? 50 : 200, // 50 AI requests per hour in production
  standardHeaders: true,
  legacyHeaders: false,
  store: config.nodeEnv === 'production' ? new RedisStore({
    client: redisClient,
    prefix: 'rl:ai:',
  }) : undefined,
  message: {
    error: {
      code: 'AI_RATE_LIMIT_EXCEEDED',
      message: 'AI request limit reached, please try again later.',
    },
  },
});

/**
 * Rate limiter for data export (resource intensive)
 */
export const exportRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: config.nodeEnv === 'production' ? 10 : 100, // 10 exports per hour in production
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'EXPORT_RATE_LIMIT_EXCEEDED',
      message: 'Export limit reached, please try again later.',
    },
  },
});
