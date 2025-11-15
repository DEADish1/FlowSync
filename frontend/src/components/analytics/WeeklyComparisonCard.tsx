'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, CalendarDays } from 'lucide-react';

interface ProductivityMetrics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  productivityScore: number;
}

interface WeeklyComparisonCardProps {
  currentWeek: ProductivityMetrics;
  previousWeek: ProductivityMetrics;
  percentageChange: number;
  trend: 'improving' | 'declining' | 'stable';
}

export function WeeklyComparisonCard({
  currentWeek,
  previousWeek,
  percentageChange,
  trend,
}: WeeklyComparisonCardProps) {
  const getTrendColor = () => {
    if (trend === 'improving') return 'text-green-600 dark:text-green-400';
    if (trend === 'declining') return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getTrendBg = () => {
    if (trend === 'improving') return 'bg-green-50 dark:bg-green-900/20';
    if (trend === 'declining') return 'bg-red-50 dark:bg-red-900/20';
    return 'bg-gray-50 dark:bg-gray-800/50';
  };

  const getTrendBorder = () => {
    if (trend === 'improving') return 'border-green-200 dark:border-green-800';
    if (trend === 'declining') return 'border-red-200 dark:border-red-800';
    return 'border-gray-200 dark:border-gray-700';
  };

  const getTrendIcon = () => {
    if (trend === 'improving')
      return <TrendingUp className="h-6 w-6 text-green-600" />;
    if (trend === 'declining')
      return <TrendingDown className="h-6 w-6 text-red-600" />;
    return <Minus className="h-6 w-6 text-gray-400" />;
  };

  const getTrendMessage = () => {
    const absChange = Math.abs(percentageChange);
    if (trend === 'improving') {
      return `Up ${absChange}% from last week`;
    } else if (trend === 'declining') {
      return `Down ${absChange}% from last week`;
    }
    return 'Steady performance';
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-electric-blue" />
          Week-over-Week
        </CardTitle>
        <CardDescription>Your progress this week vs last week</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trend indicator */}
        <div className={`p-4 rounded-lg border-2 ${getTrendBg()} ${getTrendBorder()}`}>
          <div className="flex items-center gap-3">
            {getTrendIcon()}
            <div className="flex-1">
              <div className={`text-lg font-bold ${getTrendColor()}`}>
                {trend === 'improving' && 'Improving'}
                {trend === 'declining' && 'Declining'}
                {trend === 'stable' && 'Stable'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {getTrendMessage()}
              </div>
            </div>
            <div className={`text-3xl font-bold ${getTrendColor()}`}>
              {percentageChange > 0 && '+'}
              {percentageChange.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Comparison grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Current week */}
          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-electric-blue pb-2">
              This Week
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Score</span>
                <span className="text-lg font-bold text-electric-blue">
                  {currentWeek.productivityScore}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Completed</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {currentWeek.completedTasks}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Rate</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {currentWeek.completionRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Previous week */}
          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600 pb-2">
              Last Week
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Score</span>
                <span className="text-lg font-bold text-gray-600 dark:text-gray-400">
                  {previousWeek.productivityScore}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Completed</span>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  {previousWeek.completedTasks}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Rate</span>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  {previousWeek.completionRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {trend === 'improving' && (
              <>
                <span className="font-semibold text-green-600">Great job!</span> You completed{' '}
                {currentWeek.completedTasks - previousWeek.completedTasks} more tasks this week.
              </>
            )}
            {trend === 'declining' && (
              <>
                <span className="font-semibold text-purple-aura">Keep going!</span> Review your schedule
                and energy patterns to optimize your week.
              </>
            )}
            {trend === 'stable' && (
              <>
                <span className="font-semibold text-electric-blue">Consistent!</span> You're maintaining
                steady productivity. Try setting higher goals to level up.
              </>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
