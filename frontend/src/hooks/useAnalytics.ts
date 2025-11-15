import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { api } from '@/utils/api';

interface ProductivityMetrics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  tasksCompletedOnTime: number;
  tasksCompletedLate: number;
  productivityScore: number;
}

interface EnergyPatternMetrics {
  averageEnergyByHour: Array<{ hour: number; avgEnergy: number }>;
  mostProductiveHours: number[];
  leastProductiveHours: number[];
  energyConsistency: number;
  dominantEnergyLevel: 'low' | 'neutral' | 'high';
}

interface StreakMetrics {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  streakStartDate?: string;
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
  unlockedAt?: string;
  progress?: number;
  requirement: number;
}

interface DashboardAnalytics {
  productivity: ProductivityMetrics;
  energyPatterns: EnergyPatternMetrics;
  streaks: StreakMetrics;
  weeklyComparison: WeeklyComparison;
  achievements: Achievement[];
  unlockedAchievements: number;
  totalAchievements: number;
}

export function useAnalytics() {
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardAnalytics | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [weeklyComparison, setWeeklyComparison] = useState<WeeklyComparison | null>(null);
  const [streaks, setStreaks] = useState<StreakMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch complete dashboard analytics
  const fetchDashboard = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get('/api/analytics/dashboard', token);
      const data = await response.json();

      setDashboard(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics');
      console.error('Error fetching dashboard analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch achievements
  const fetchAchievements = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get('/api/analytics/achievements', token);
      const data = await response.json();

      setAchievements(data.achievements || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch achievements');
      console.error('Error fetching achievements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch weekly comparison
  const fetchWeeklyComparison = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get('/api/analytics/weekly-comparison', token);
      const data = await response.json();

      setWeeklyComparison(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch weekly comparison');
      console.error('Error fetching weekly comparison:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch streaks
  const fetchStreaks = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get('/api/analytics/streaks', token);
      const data = await response.json();

      setStreaks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch streaks');
      console.error('Error fetching streaks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch dashboard on mount
  useEffect(() => {
    if (token) {
      fetchDashboard();
    }
  }, [token]);

  return {
    dashboard,
    achievements,
    weeklyComparison,
    streaks,
    isLoading,
    error,
    fetchDashboard,
    fetchAchievements,
    fetchWeeklyComparison,
    fetchStreaks,
  };
}
