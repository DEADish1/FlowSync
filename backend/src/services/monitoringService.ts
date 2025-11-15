import { Counter, Histogram, Gauge, register } from 'prom-client';
import { Pool } from 'pg';
import Redis from 'ioredis';

/**
 * Monitoring Service
 * Tracks custom business metrics and system health
 */
export class MonitoringService {
  // HTTP metrics
  private httpRequestsTotal: Counter;
  private httpRequestDuration: Histogram;
  private httpRequestErrors: Counter;

  // Business metrics
  private tasksCreated: Counter;
  private tasksCompleted: Counter;
  private energyLogsCreated: Counter;
  private aiQueriesTotal: Counter;
  private aiQueryDuration: Histogram;

  // System metrics
  private databaseConnections: Gauge;
  private redisConnections: Gauge;
  private activeUsers: Gauge;

  constructor() {
    // HTTP request metrics
    this.httpRequestsTotal = new Counter({
      name: 'flowsync_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    });

    this.httpRequestDuration = new Histogram({
      name: 'flowsync_http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5, 10],
    });

    this.httpRequestErrors = new Counter({
      name: 'flowsync_http_request_errors_total',
      help: 'Total number of HTTP request errors',
      labelNames: ['method', 'route', 'error_type'],
    });

    // Business metrics
    this.tasksCreated = new Counter({
      name: 'flowsync_tasks_created_total',
      help: 'Total number of tasks created',
      labelNames: ['user_id'],
    });

    this.tasksCompleted = new Counter({
      name: 'flowsync_tasks_completed_total',
      help: 'Total number of tasks completed',
      labelNames: ['user_id'],
    });

    this.energyLogsCreated = new Counter({
      name: 'flowsync_energy_logs_created_total',
      help: 'Total number of energy logs created',
      labelNames: ['energy_level'],
    });

    this.aiQueriesTotal = new Counter({
      name: 'flowsync_ai_queries_total',
      help: 'Total number of AI queries',
      labelNames: ['query_type'],
    });

    this.aiQueryDuration = new Histogram({
      name: 'flowsync_ai_query_duration_seconds',
      help: 'AI query duration in seconds',
      labelNames: ['query_type'],
      buckets: [0.1, 0.5, 1, 2, 5, 10, 20, 30],
    });

    // System metrics
    this.databaseConnections = new Gauge({
      name: 'flowsync_database_connections',
      help: 'Number of active database connections',
    });

    this.redisConnections = new Gauge({
      name: 'flowsync_redis_connections',
      help: 'Number of active Redis connections',
    });

    this.activeUsers = new Gauge({
      name: 'flowsync_active_users',
      help: 'Number of active users in the last 5 minutes',
    });
  }

  // HTTP tracking methods
  trackHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestsTotal.inc({ method, route, status_code: statusCode });
    this.httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
  }

  trackHttpError(method: string, route: string, errorType: string) {
    this.httpRequestErrors.inc({ method, route, error_type: errorType });
  }

  // Business tracking methods
  trackTaskCreated(userId: number) {
    this.tasksCreated.inc({ user_id: userId });
  }

  trackTaskCompleted(userId: number) {
    this.tasksCompleted.inc({ user_id: userId });
  }

  trackEnergyLog(energyLevel: number) {
    const level = energyLevel >= 7 ? 'high' : energyLevel >= 4 ? 'medium' : 'low';
    this.energyLogsCreated.inc({ energy_level: level });
  }

  trackAIQuery(queryType: string, duration: number) {
    this.aiQueriesTotal.inc({ query_type: queryType });
    this.aiQueryDuration.observe({ query_type: queryType }, duration);
  }

  // System tracking methods
  async updateDatabaseMetrics(db: Pool) {
    try {
      const result = await db.query(`
        SELECT count(*) as total_connections,
               sum(CASE WHEN state = 'active' THEN 1 ELSE 0 END) as active_connections
        FROM pg_stat_activity
        WHERE datname = current_database()
      `);

      if (result.rows[0]) {
        this.databaseConnections.set(parseInt(result.rows[0].total_connections) || 0);
      }
    } catch (error) {
      console.error('Failed to update database metrics:', error);
    }
  }

  async updateRedisMetrics(redis: Redis) {
    try {
      const info = await redis.info('clients');
      const match = info.match(/connected_clients:(\d+)/);
      if (match && match[1]) {
        this.redisConnections.set(parseInt(match[1]));
      }
    } catch (error) {
      console.error('Failed to update Redis metrics:', error);
    }
  }

  async updateActiveUsersMetric(db: Pool) {
    try {
      // Count users who have created tasks or energy logs in the last 5 minutes
      const result = await db.query(`
        SELECT COUNT(DISTINCT user_id) as active_users
        FROM (
          SELECT user_id, created_at FROM tasks WHERE created_at > NOW() - INTERVAL '5 minutes'
          UNION ALL
          SELECT user_id, created_at FROM energy_logs WHERE created_at > NOW() - INTERVAL '5 minutes'
        ) as recent_activity
      `);

      if (result.rows[0]) {
        this.activeUsers.set(parseInt(result.rows[0].active_users) || 0);
      }
    } catch (error) {
      console.error('Failed to update active users metric:', error);
    }
  }

  // Update all system metrics
  async updateSystemMetrics(db?: Pool, redis?: Redis) {
    if (db) {
      await this.updateDatabaseMetrics(db);
      await this.updateActiveUsersMetric(db);
    }

    if (redis) {
      await this.updateRedisMetrics(redis);
    }
  }

  // Get current metrics as JSON (for debugging)
  async getMetrics() {
    return await register.metrics();
  }

  // Reset all metrics (for testing)
  reset() {
    register.resetMetrics();
  }
}

// Singleton instance
export const monitoringService = new MonitoringService();
