import { createClient } from 'redis';
import { config } from './config';
import { logger } from './logger';

export const redisClient = createClient({
  url: config.redis.url,
});

redisClient.on('error', (err) => {
  logger.error('Redis error:', err);
});

redisClient.on('connect', () => {
  logger.info('Redis connected');
});

export async function connectRedis(): Promise<void> {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    throw error;
  }
}

export async function disconnectRedis(): Promise<void> {
  await redisClient.quit();
  logger.info('Redis disconnected');
}

// Helper functions
export async function cacheSet(key: string, value: any, expirySeconds?: number): Promise<void> {
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
  if (expirySeconds) {
    await redisClient.setEx(key, expirySeconds, stringValue);
  } else {
    await redisClient.set(key, stringValue);
  }
}

export async function cacheGet<T = any>(key: string): Promise<T | null> {
  const value = await redisClient.get(key);
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return value as T;
  }
}

export async function cacheDel(key: string): Promise<void> {
  await redisClient.del(key);
}
