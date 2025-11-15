import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import Redis from 'ioredis';
import { register, collectDefaultMetrics } from 'prom-client';

const router = Router();

// Collect default metrics (CPU, memory, event loop, etc.)
collectDefaultMetrics({ prefix: 'flowsync_' });

/**
 * Basic health check - returns OK if service is running
 * Used by Docker healthcheck
 */
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * Liveness probe - checks if the application is alive
 * If this fails, the container should be restarted
 */
router.get('/health/live', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Readiness probe - checks if the application is ready to serve traffic
 * Checks database and Redis connectivity
 * If this fails, traffic should not be routed to this instance
 */
router.get('/health/ready', async (req: Request, res: Response) => {
  const checks: Record<string, any> = {
    timestamp: new Date().toISOString(),
    status: 'ready',
    checks: {
      database: { status: 'unknown' },
      redis: { status: 'unknown' },
    },
  };

  let isReady = true;

  // Check database connectivity
  try {
    const db = (req.app.locals.db || req.app.get('db')) as Pool;
    if (db) {
      const start = Date.now();
      const result = await db.query('SELECT 1 as health_check');
      const duration = Date.now() - start;

      checks.checks.database = {
        status: result.rows[0]?.health_check === 1 ? 'healthy' : 'unhealthy',
        responseTime: `${duration}ms`,
      };
    } else {
      checks.checks.database = { status: 'not_configured' };
      isReady = false;
    }
  } catch (error) {
    checks.checks.database = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    isReady = false;
  }

  // Check Redis connectivity
  try {
    const redis = (req.app.locals.redis || req.app.get('redis')) as Redis;
    if (redis) {
      const start = Date.now();
      const pong = await redis.ping();
      const duration = Date.now() - start;

      checks.checks.redis = {
        status: pong === 'PONG' ? 'healthy' : 'unhealthy',
        responseTime: `${duration}ms`,
      };
    } else {
      checks.checks.redis = { status: 'not_configured' };
    }
  } catch (error) {
    checks.checks.redis = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    // Redis is not critical for readiness
    // isReady = false;
  }

  if (!isReady) {
    checks.status = 'not_ready';
    return res.status(503).json(checks);
  }

  res.status(200).json(checks);
});

/**
 * Prometheus metrics endpoint
 * Exposes application metrics in Prometheus format
 */
router.get('/metrics', async (_req: Request, res: Response) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to collect metrics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Detailed system info (should be protected in production)
 */
router.get('/health/info', (_req: Request, res: Response) => {
  const info = {
    application: {
      name: 'FlowSync API',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    },
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      uptime: process.uptime(),
      pid: process.pid,
    },
    memory: {
      ...process.memoryUsage(),
      formatted: {
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(process.memoryUsage().external / 1024 / 1024)}MB`,
      },
    },
    timestamp: new Date().toISOString(),
  };

  res.status(200).json(info);
});

export default router;
