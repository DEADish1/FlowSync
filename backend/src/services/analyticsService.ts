import { pool } from '../utils/db';
import { EnergyLevel } from '../types';
import { logger } from '../utils/logger';

interface ProductivityMetrics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageCompletionTime: number; // minutes
  tasksCompletedOnTime: number;
  tasksCompletedLate: number;
  productivityScore: number; // 0-100
}

interface EnergyPatternMetrics {
  averageEnergyByHour: Array<{ hour: number; avgEnergy: number }>;
  mostProductiveHours: number[];
  leastProductiveHours: number[];
  energyConsistency: number; // 0-100
  dominantEnergyLevel: EnergyLevel;
}

interface StreakMetrics {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  streakStartDate?: Date;
}

interface GoalProgress {
  goalId: number;
  goalName: string;
  targetValue: number;
  currentValue: number;
  progressPercentage: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  deadline?: Date;
}

interface WeeklyComparison {
  currentWeek: ProductivityMetrics;
  previousWeek: ProductivityMetrics;
  percentageChange: number;
  trend: 'improving' | 'declining' | 'stable';
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress?: number;
  requirement: number;
}

export class AnalyticsService {
  /**
   * Get comprehensive productivity metrics for a date range
   */
  async getProductivityMetrics(
    userId: number,
    startDate: Date,
    endDate: Date
  ): Promise<ProductivityMetrics> {
    try {
      const tasksQuery = `
        SELECT
          COUNT(*) as total_tasks,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
          COUNT(CASE WHEN status = 'completed' AND deadline IS NOT NULL AND updated_at <= deadline THEN 1 END) as on_time,
          COUNT(CASE WHEN status = 'completed' AND deadline IS NOT NULL AND updated_at > deadline THEN 1 END) as late,
          AVG(CASE WHEN status = 'completed' AND estimated_duration IS NOT NULL
            THEN EXTRACT(EPOCH FROM (updated_at - created_at)) / 60
          END) as avg_completion_time
        FROM tasks
        WHERE user_id = $1
          AND created_at >= $2
          AND created_at <= $3
      `;

      const result = await pool.query(tasksQuery, [userId, startDate, endDate]);
      const row = result.rows[0];

      const totalTasks = parseInt(row.total_tasks);
      const completedTasks = parseInt(row.completed_tasks);
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      const tasksCompletedOnTime = parseInt(row.on_time || 0);
      const tasksCompletedLate = parseInt(row.late || 0);

      // Calculate productivity score (0-100)
      const productivityScore = this.calculateProductivityScore({
        completionRate,
        onTimeRate: tasksCompletedOnTime > 0
          ? (tasksCompletedOnTime / (tasksCompletedOnTime + tasksCompletedLate)) * 100
          : 100,
        totalTasks,
      });

      return {
        totalTasks,
        completedTasks,
        completionRate: Math.round(completionRate * 10) / 10,
        averageCompletionTime: Math.round(parseFloat(row.avg_completion_time || 0)),
        tasksCompletedOnTime,
        tasksCompletedLate,
        productivityScore: Math.round(productivityScore),
      };
    } catch (error) {
      logger.error('Error getting productivity metrics:', error);
      throw error;
    }
  }

  /**
   * Calculate overall productivity score
   */
  private calculateProductivityScore(params: {
    completionRate: number;
    onTimeRate: number;
    totalTasks: number;
  }): number {
    const { completionRate, onTimeRate, totalTasks } = params;

    // Weighted scoring
    let score = 0;

    // Completion rate (40% weight)
    score += completionRate * 0.4;

    // On-time rate (30% weight)
    score += onTimeRate * 0.3;

    // Volume bonus (30% weight, max 30 points)
    // More tasks completed = higher score
    const volumeScore = Math.min(totalTasks / 20, 1) * 30;
    score += volumeScore;

    return Math.min(score, 100);
  }

  /**
   * Get energy pattern metrics and insights
   */
  async getEnergyPatternMetrics(
    userId: number,
    startDate: Date,
    endDate: Date
  ): Promise<EnergyPatternMetrics> {
    try {
      const energyQuery = `
        SELECT
          EXTRACT(HOUR FROM timestamp) as hour,
          energy_level,
          COUNT(*) as count
        FROM energy_logs
        WHERE user_id = $1
          AND timestamp >= $2
          AND timestamp <= $3
        GROUP BY EXTRACT(HOUR FROM timestamp), energy_level
        ORDER BY hour
      `;

      const result = await pool.query(energyQuery, [userId, startDate, endDate]);

      // Aggregate energy by hour
      const hourlyData: Map<number, { high: number; neutral: number; low: number; total: number }> = new Map();

      result.rows.forEach(row => {
        const hour = parseInt(row.hour);
        const level = row.energy_level as EnergyLevel;
        const count = parseInt(row.count);

        if (!hourlyData.has(hour)) {
          hourlyData.set(hour, { high: 0, neutral: 0, low: 0, total: 0 });
        }

        const data = hourlyData.get(hour)!;
        data[level] = count;
        data.total += count;
      });

      // Calculate average energy by hour (high=3, neutral=2, low=1)
      const averageEnergyByHour = Array.from(hourlyData.entries())
        .map(([hour, data]) => {
          const weightedSum = data.high * 3 + data.neutral * 2 + data.low * 1;
          const avgEnergy = data.total > 0 ? weightedSum / data.total : 2;
          return { hour, avgEnergy };
        })
        .sort((a, b) => a.hour - b.hour);

      // Find most and least productive hours
      const sortedByEnergy = [...averageEnergyByHour].sort((a, b) => b.avgEnergy - a.avgEnergy);
      const mostProductiveHours = sortedByEnergy.slice(0, 3).map(h => h.hour);
      const leastProductiveHours = sortedByEnergy.slice(-3).map(h => h.hour);

      // Calculate energy consistency (lower variance = more consistent)
      const energyValues = averageEnergyByHour.map(h => h.avgEnergy);
      const avgEnergy = energyValues.reduce((a, b) => a + b, 0) / energyValues.length;
      const variance = energyValues.reduce((sum, val) => sum + Math.pow(val - avgEnergy, 2), 0) / energyValues.length;
      const stdDev = Math.sqrt(variance);
      const energyConsistency = Math.max(0, 100 - (stdDev * 50)); // Convert to 0-100 scale

      // Determine dominant energy level
      const totalHigh = Array.from(hourlyData.values()).reduce((sum, d) => sum + d.high, 0);
      const totalNeutral = Array.from(hourlyData.values()).reduce((sum, d) => sum + d.neutral, 0);
      const totalLow = Array.from(hourlyData.values()).reduce((sum, d) => sum + d.low, 0);
      const dominantEnergyLevel: EnergyLevel =
        totalHigh > totalNeutral && totalHigh > totalLow
          ? 'high'
          : totalLow > totalNeutral
          ? 'low'
          : 'neutral';

      return {
        averageEnergyByHour,
        mostProductiveHours,
        leastProductiveHours,
        energyConsistency: Math.round(energyConsistency),
        dominantEnergyLevel,
      };
    } catch (error) {
      logger.error('Error getting energy pattern metrics:', error);
      throw error;
    }
  }

  /**
   * Get streak metrics
   */
  async getStreakMetrics(userId: number): Promise<StreakMetrics> {
    try {
      // Get all dates where user logged energy or completed tasks
      const activityQuery = `
        SELECT DISTINCT DATE(timestamp) as activity_date
        FROM energy_logs
        WHERE user_id = $1
        UNION
        SELECT DISTINCT DATE(updated_at) as activity_date
        FROM tasks
        WHERE user_id = $1 AND status = 'completed'
        ORDER BY activity_date DESC
      `;

      const result = await pool.query(activityQuery, [userId]);
      const activityDates = result.rows.map(row => new Date(row.activity_date));

      if (activityDates.length === 0) {
        return {
          currentStreak: 0,
          longestStreak: 0,
          totalActiveDays: 0,
        };
      }

      // Calculate current streak
      let currentStreak = 0;
      let streakStartDate: Date | undefined;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < activityDates.length; i++) {
        const activityDate = new Date(activityDates[i]);
        activityDate.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor((today.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === currentStreak) {
          currentStreak++;
          streakStartDate = activityDate;
        } else {
          break;
        }
      }

      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 1;

      for (let i = 0; i < activityDates.length - 1; i++) {
        const current = new Date(activityDates[i]);
        const next = new Date(activityDates[i + 1]);

        const daysDiff = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

      return {
        currentStreak,
        longestStreak,
        totalActiveDays: activityDates.length,
        streakStartDate,
      };
    } catch (error) {
      logger.error('Error getting streak metrics:', error);
      throw error;
    }
  }

  /**
   * Get week-over-week comparison
   */
  async getWeeklyComparison(userId: number): Promise<WeeklyComparison> {
    try {
      const now = new Date();
      const currentWeekStart = new Date(now);
      currentWeekStart.setDate(now.getDate() - now.getDay()); // Start of current week
      currentWeekStart.setHours(0, 0, 0, 0);

      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setDate(currentWeekStart.getDate() + 7);

      const previousWeekStart = new Date(currentWeekStart);
      previousWeekStart.setDate(currentWeekStart.getDate() - 7);

      const previousWeekEnd = new Date(currentWeekStart);

      const currentWeek = await this.getProductivityMetrics(userId, currentWeekStart, currentWeekEnd);
      const previousWeek = await this.getProductivityMetrics(userId, previousWeekStart, previousWeekEnd);

      // Calculate percentage change in productivity score
      const percentageChange =
        previousWeek.productivityScore > 0
          ? ((currentWeek.productivityScore - previousWeek.productivityScore) / previousWeek.productivityScore) * 100
          : 0;

      const trend: 'improving' | 'declining' | 'stable' =
        Math.abs(percentageChange) < 5
          ? 'stable'
          : percentageChange > 0
          ? 'improving'
          : 'declining';

      return {
        currentWeek,
        previousWeek,
        percentageChange: Math.round(percentageChange * 10) / 10,
        trend,
      };
    } catch (error) {
      logger.error('Error getting weekly comparison:', error);
      throw error;
    }
  }

  /**
   * Get achievements and progress
   */
  async getAchievements(userId: number): Promise<Achievement[]> {
    try {
      // Get user stats
      const stats = await this.getUserStats(userId);

      const achievements: Achievement[] = [
        {
          id: 'first-task',
          name: 'Getting Started',
          description: 'Complete your first task',
          icon: '🎯',
          progress: Math.min(stats.totalCompletedTasks, 1),
          requirement: 1,
          unlockedAt: stats.totalCompletedTasks >= 1 ? stats.firstTaskCompletedAt : undefined,
        },
        {
          id: 'task-master-10',
          name: 'Task Master',
          description: 'Complete 10 tasks',
          icon: '⭐',
          progress: Math.min(stats.totalCompletedTasks, 10),
          requirement: 10,
          unlockedAt: stats.totalCompletedTasks >= 10 ? undefined : undefined,
        },
        {
          id: 'task-champion-50',
          name: 'Task Champion',
          description: 'Complete 50 tasks',
          icon: '🏆',
          progress: Math.min(stats.totalCompletedTasks, 50),
          requirement: 50,
          unlockedAt: stats.totalCompletedTasks >= 50 ? undefined : undefined,
        },
        {
          id: 'week-warrior',
          name: 'Week Warrior',
          description: 'Maintain a 7-day streak',
          icon: '🔥',
          progress: Math.min(stats.longestStreak, 7),
          requirement: 7,
          unlockedAt: stats.longestStreak >= 7 ? undefined : undefined,
        },
        {
          id: 'month-master',
          name: 'Month Master',
          description: 'Maintain a 30-day streak',
          icon: '💎',
          progress: Math.min(stats.longestStreak, 30),
          requirement: 30,
          unlockedAt: stats.longestStreak >= 30 ? undefined : undefined,
        },
        {
          id: 'energy-tracker',
          name: 'Energy Tracker',
          description: 'Log your energy 30 times',
          icon: '⚡',
          progress: Math.min(stats.totalEnergyLogs, 30),
          requirement: 30,
          unlockedAt: stats.totalEnergyLogs >= 30 ? undefined : undefined,
        },
        {
          id: 'flow-seeker',
          name: 'Flow Seeker',
          description: 'Complete 10 flow blocks',
          icon: '🌊',
          progress: Math.min(stats.totalFlowBlocks, 10),
          requirement: 10,
          unlockedAt: stats.totalFlowBlocks >= 10 ? undefined : undefined,
        },
        {
          id: 'perfectionist',
          name: 'Perfectionist',
          description: 'Achieve 100% task completion rate in a week',
          icon: '💯',
          progress: stats.perfectWeeks > 0 ? 1 : 0,
          requirement: 1,
          unlockedAt: stats.perfectWeeks > 0 ? undefined : undefined,
        },
      ];

      return achievements;
    } catch (error) {
      logger.error('Error getting achievements:', error);
      throw error;
    }
  }

  /**
   * Get user statistics for achievements
   */
  private async getUserStats(userId: number) {
    const statsQuery = `
      SELECT
        (SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND status = 'completed') as total_completed,
        (SELECT MIN(updated_at) FROM tasks WHERE user_id = $1 AND status = 'completed') as first_completed,
        (SELECT COUNT(*) FROM energy_logs WHERE user_id = $1) as total_energy_logs,
        (SELECT COUNT(*) FROM flow_blocks WHERE user_id = $1 AND status = 'completed') as total_flow_blocks
    `;

    const result = await pool.query(statsQuery, [userId]);
    const row = result.rows[0];

    // Get streak info
    const streakMetrics = await this.getStreakMetrics(userId);

    // Check for perfect weeks
    const perfectWeeksQuery = `
      SELECT COUNT(*) as perfect_weeks
      FROM (
        SELECT
          DATE_TRUNC('week', created_at) as week,
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
        FROM tasks
        WHERE user_id = $1
        GROUP BY DATE_TRUNC('week', created_at)
        HAVING COUNT(*) > 0 AND COUNT(*) = COUNT(CASE WHEN status = 'completed' THEN 1 END)
      ) weeks
    `;

    const perfectWeeksResult = await pool.query(perfectWeeksQuery, [userId]);

    return {
      totalCompletedTasks: parseInt(row.total_completed || 0),
      firstTaskCompletedAt: row.first_completed,
      totalEnergyLogs: parseInt(row.total_energy_logs || 0),
      totalFlowBlocks: parseInt(row.total_flow_blocks || 0),
      longestStreak: streakMetrics.longestStreak,
      perfectWeeks: parseInt(perfectWeeksResult.rows[0]?.perfect_weeks || 0),
    };
  }

  /**
   * Get comprehensive analytics dashboard data
   */
  async getDashboardAnalytics(userId: number) {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);

      const [
        productivityMetrics,
        energyPatternMetrics,
        streakMetrics,
        weeklyComparison,
        achievements,
      ] = await Promise.all([
        this.getProductivityMetrics(userId, thirtyDaysAgo, now),
        this.getEnergyPatternMetrics(userId, thirtyDaysAgo, now),
        this.getStreakMetrics(userId),
        this.getWeeklyComparison(userId),
        this.getAchievements(userId),
      ]);

      return {
        productivity: productivityMetrics,
        energyPatterns: energyPatternMetrics,
        streaks: streakMetrics,
        weeklyComparison,
        achievements: achievements.filter(a => a.unlockedAt || a.progress! > 0),
        unlockedAchievements: achievements.filter(a => a.unlockedAt).length,
        totalAchievements: achievements.length,
      };
    } catch (error) {
      logger.error('Error getting dashboard analytics:', error);
      throw error;
    }
  }
}
