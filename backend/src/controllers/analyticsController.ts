import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { EnergyAnalyticsService } from '../services/energyAnalyticsService';
import { pool } from '../utils/db';

const energyAnalytics = new EnergyAnalyticsService(pool);

export class AnalyticsController {
  async getEnergyMap(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const days = parseInt(req.query.days as string) || 7;

      const map = await energyAnalytics.getEnergyMap(userId, days);

      res.json({ energyMap: map });
    } catch (error) {
      next(error);
    }
  }

  async getBestTimes(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const bestTimes = await energyAnalytics.predictBestTimes(userId);

      res.json({ bestTimes });
    } catch (error) {
      next(error);
    }
  }

  async getProductivityScore(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      // Calculate productivity score based on completed tasks and energy levels
      const result = await pool.query(
        `SELECT
           COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
           COUNT(*) as total_tasks,
           AVG(CASE
             WHEN el.energy_level = 'high' THEN 100
             WHEN el.energy_level = 'neutral' THEN 50
             ELSE 0
           END) as avg_energy
         FROM tasks t
         LEFT JOIN energy_logs el ON el.user_id = t.user_id
           AND DATE(el.timestamp) = DATE(t.updated_at)
         WHERE t.user_id = $1
           AND t.created_at >= NOW() - INTERVAL '7 days'`,
        [userId]
      );

      const data = result.rows[0];
      const completionRate = data.total_tasks > 0
        ? (data.completed_tasks / data.total_tasks) * 100
        : 0;

      const productivityScore = Math.round((completionRate + (data.avg_energy || 0)) / 2);

      res.json({
        productivityScore,
        completedTasks: parseInt(data.completed_tasks),
        totalTasks: parseInt(data.total_tasks),
        completionRate: Math.round(completionRate),
      });
    } catch (error) {
      next(error);
    }
  }
}
