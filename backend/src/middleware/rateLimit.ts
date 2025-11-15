import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '../utils/redis';

/**
 * General API Rate Limiter
 * 100 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: {
      message: 'Too many requests, please try again later',
      statusCode: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use Redis store in production for distributed rate limiting
  ...(process.env.NODE_ENV === 'production' && redisClient ? {
    store: new RedisStore({
      // @ts-expect-error - RedisStore types issue
      client: redisClient,
      prefix: 'rl:general:',
    }),
  } : {}),
});

/**
 * Authentication Rate Limiter
 * 5 requests per 15 minutes per IP
 * Stricter for login/register endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts, please try again later',
      statusCode: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  ...(process.env.NODE_ENV === 'production' && redisClient ? {
    store: new RedisStore({
      // @ts-expect-error - RedisStore types issue
      client: redisClient,
      prefix: 'rl:auth:',
    }),
  } : {}),
});

/**
 * API Endpoint Rate Limiter
 * 60 requests per minute per IP
 * For regular API endpoints
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: {
    success: false,
    error: {
      message: 'API rate limit exceeded',
      statusCode: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  ...(process.env.NODE_ENV === 'production' && redisClient ? {
    store: new RedisStore({
      // @ts-expect-error - RedisStore types issue
      client: redisClient,
      prefix: 'rl:api:',
    }),
  } : {}),
});

/**
 * AI Query Rate Limiter
 * 10 requests per hour per user
 * For expensive AI operations
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    return (req as any).user?.id?.toString() || req.ip || 'anonymous';
  },
  message: {
    success: false,
    error: {
      message: 'AI query limit exceeded, please try again later',
      statusCode: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  ...(process.env.NODE_ENV === 'production' && redisClient ? {
    store: new RedisStore({
      // @ts-expect-error - RedisStore types issue
      client: redisClient,
      prefix: 'rl:ai:',
    }),
  } : {}),
});

/**
 * File Upload Rate Limiter
 * 10 uploads per hour per user
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => {
    return (req as any).user?.id?.toString() || req.ip || 'anonymous';
  },
  message: {
    success: false,
    error: {
      message: 'Upload limit exceeded',
      statusCode: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  ...(process.env.NODE_ENV === 'production' && redisClient ? {
    store: new RedisStore({
      // @ts-expect-error - RedisStore types issue
      client: redisClient,
      prefix: 'rl:upload:',
    }),
  } : {}),
});
