import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { MoodAnalyzerService } from '../services/moodAnalyzerService';
import { EnergyAnalyticsService } from '../services/energyAnalyticsService';
import { pool } from '../utils/db';

const moodAnalyzer = new MoodAnalyzerService();
const energyAnalytics = new EnergyAnalyticsService(pool);

export class MoodController {
  async analyzeMood(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { text } = req.body;
      const userId = req.user!.userId;

      const analysis = await moodAnalyzer.analyzeMood(text);

      // Log the mood
      await energyAnalytics.logEnergy(userId, {
        energyLevel: analysis.energyLevel,
        moodCategory: analysis.moodCategory,
        context: text,
      });

      res.json(analysis);
    } catch (error) {
      next(error);
    }
  }

  async logEnergy(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { energyLevel, moodCategory, context } = req.body;
      const userId = req.user!.userId;

      await energyAnalytics.logEnergy(userId, {
        energyLevel,
        moodCategory,
        context,
      });

      res.json({ message: 'Energy logged successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const days = parseInt(req.query.days as string) || 7;

      const result = await pool.query(
        `SELECT id, timestamp, energy_level, mood_category, context, productivity_score
         FROM energy_logs
         WHERE user_id = $1 AND timestamp >= NOW() - INTERVAL '${days} days'
         ORDER BY timestamp DESC`,
        [userId]
      );

      res.json({ logs: result.rows });
    } catch (error) {
      next(error);
    }
  }

  async getPatterns(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const result = await pool.query(
        `SELECT hour_of_day, day_of_week, avg_energy_level, sample_count
         FROM energy_patterns
         WHERE user_id = $1
         ORDER BY day_of_week, hour_of_day`,
        [userId]
      );

      res.json({ patterns: result.rows });
    } catch (error) {
      next(error);
    }
  }
}
