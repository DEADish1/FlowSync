import { Pool } from 'pg';
import { EnergyLevel } from '../types';
import { logger } from '../utils/logger';

export class EnergyAnalyticsService {
  constructor(private db: Pool) {}

  async logEnergy(
    userId: number,
    data: {
      energyLevel: EnergyLevel;
      moodCategory?: string;
      context?: string;
    }
  ): Promise<void> {
    try {
      await this.db.query(
        `INSERT INTO energy_logs (user_id, energy_level, mood_category, context)
         VALUES ($1, $2, $3, $4)`,
        [userId, data.energyLevel, data.moodCategory, data.context]
      );

      // Update patterns asynchronously
      this.updatePatterns(userId).catch(err =>
        logger.error('Error updating energy patterns:', err)
      );
    } catch (error) {
      logger.error('Error logging energy:', error);
      throw error;
    }
  }

  async getEnergyMap(userId: number, days: number = 7): Promise<any[][]> {
    try {
      const result = await this.db.query(
        `SELECT
           EXTRACT(HOUR FROM timestamp)::INTEGER as hour,
           EXTRACT(DOW FROM timestamp)::INTEGER as day_of_week,
           energy_level,
           COUNT(*) as count
         FROM energy_logs
         WHERE user_id = $1
           AND timestamp >= NOW() - INTERVAL '${days} days'
         GROUP BY hour, day_of_week, energy_level
         ORDER BY day_of_week, hour`,
        [userId]
      );

      return this.formatEnergyMap(result.rows);
    } catch (error) {
      logger.error('Error getting energy map:', error);
      throw error;
    }
  }

  async predictBestTimes(userId: number): Promise<any[]> {
    try {
      const result = await this.db.query(
        `SELECT
           hour_of_day,
           day_of_week,
           avg_energy_level
         FROM energy_patterns
         WHERE user_id = $1
         ORDER BY avg_energy_level DESC
         LIMIT 10`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      logger.error('Error predicting best times:', error);
      throw error;
    }
  }

  private async updatePatterns(userId: number): Promise<void> {
    try {
      await this.db.query(
        `INSERT INTO energy_patterns (user_id, hour_of_day, day_of_week, avg_energy_level, sample_count)
         SELECT
           user_id,
           EXTRACT(HOUR FROM timestamp)::INTEGER as hour_of_day,
           EXTRACT(DOW FROM timestamp)::INTEGER as day_of_week,
           AVG(CASE
             WHEN energy_level = 'high' THEN 1.0
             WHEN energy_level = 'neutral' THEN 0.5
             ELSE 0.0
           END) as avg_energy_level,
           COUNT(*) as sample_count
         FROM energy_logs
         WHERE user_id = $1
         GROUP BY user_id, hour_of_day, day_of_week
         ON CONFLICT (user_id, hour_of_day, day_of_week)
         DO UPDATE SET
           avg_energy_level = EXCLUDED.avg_energy_level,
           sample_count = EXCLUDED.sample_count,
           last_updated = NOW()`,
        [userId]
      );
    } catch (error) {
      logger.error('Error updating patterns:', error);
      throw error;
    }
  }

  private formatEnergyMap(rows: any[]): any[][] {
    // Format into 7x24 grid for visualization
    const map: any[][] = Array(7)
      .fill(null)
      .map(() => Array(24).fill(null));

    rows.forEach((row) => {
      const day = row.day_of_week;
      const hour = row.hour;
      if (!map[day][hour]) {
        map[day][hour] = { low: 0, neutral: 0, high: 0 };
      }
      map[day][hour][row.energy_level] = parseInt(row.count);
    });

    return map;
  }
}
