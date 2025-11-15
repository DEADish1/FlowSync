'use client';

import { useAnalytics } from '@/hooks/useAnalytics';
import { ProductivityScoreCard } from '@/components/analytics/ProductivityScoreCard';
import { AchievementBadges } from '@/components/analytics/AchievementBadges';
import { WeeklyComparisonCard } from '@/components/analytics/WeeklyComparisonCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, TrendingUp, Zap, Calendar } from 'lucide-react';
import { StreakCard } from '@/components/dashboard/StreakCard';

export default function AnalyticsPage() {
  const { dashboard, isLoading } = useAnalytics();

  if (isLoading || !dashboard) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Analytics</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Loading your insights...
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-64 bg-gray-100 dark:bg-gray-800" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const { productivity, energyPatterns, streaks, weeklyComparison, achievements, unlockedAchievements, totalAchievements } = dashboard;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient">Analytics & Insights</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Track your progress and uncover productivity patterns
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Productivity Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gradient">{productivity.productivityScore}</div>
            <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {productivity.completionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {productivity.completedTasks} of {productivity.totalTasks} tasks
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Energy Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold capitalize text-purple-aura">
              {energyPatterns.dominantEnergyLevel}
            </div>
            <p className="text-xs text-gray-500 mt-1">Most common state</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {streaks.currentStreak}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {streaks.currentStreak === 1 ? 'day' : 'days'} active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Productivity Score */}
        <ProductivityScoreCard
          score={productivity.productivityScore}
          completionRate={productivity.completionRate}
          totalTasks={productivity.totalTasks}
          completedTasks={productivity.completedTasks}
          trend={weeklyComparison.trend}
          percentageChange={weeklyComparison.percentageChange}
        />

        {/* Weekly Comparison */}
        <WeeklyComparisonCard
          currentWeek={weeklyComparison.currentWeek}
          previousWeek={weeklyComparison.previousWeek}
          percentageChange={weeklyComparison.percentageChange}
          trend={weeklyComparison.trend}
        />
      </div>

      {/* Energy Patterns */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-electric-blue" />
            Energy Patterns
          </CardTitle>
          <CardDescription>Your typical energy levels throughout the day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Most productive hours */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Peak Productivity Hours
              </h4>
              <div className="flex gap-2">
                {energyPatterns.mostProductiveHours.map((hour) => (
                  <div
                    key={hour}
                    className="px-3 py-2 bg-gradient-to-br from-electric-blue/20 to-purple-aura/20 border border-electric-blue/30 rounded-lg text-sm font-medium"
                  >
                    {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                  </div>
                ))}
              </div>
            </div>

            {/* Energy consistency */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Energy Consistency
                </h4>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {energyPatterns.energyConsistency}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-electric-blue to-purple-aura h-3 rounded-full transition-all duration-500"
                  style={{ width: `${energyPatterns.energyConsistency}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {energyPatterns.energyConsistency >= 75
                  ? 'Very consistent energy patterns - great for predictable scheduling!'
                  : energyPatterns.energyConsistency >= 50
                  ? 'Moderately consistent - some variation in daily energy.'
                  : 'Varied energy patterns - focus on building routines.'}
              </p>
            </div>

            {/* Hourly heatmap */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Daily Energy Map
              </h4>
              <div className="grid grid-cols-12 gap-1">
                {energyPatterns.averageEnergyByHour.map(({ hour, avgEnergy }) => {
                  const intensity = avgEnergy / 3; // Normalize to 0-1
                  const bgColor =
                    intensity > 0.75
                      ? 'bg-green-500'
                      : intensity > 0.5
                      ? 'bg-yellow-500'
                      : 'bg-blue-500';

                  return (
                    <div
                      key={hour}
                      className="group relative"
                      title={`${hour}:00 - Energy: ${avgEnergy.toFixed(1)}`}
                    >
                      <div className={`aspect-square rounded ${bgColor} opacity-${Math.round(intensity * 100)}`} />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {hour}:00
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Low Energy</span>
                <span>High Energy</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Streak Card */}
      <StreakCard
        currentStreak={streaks.currentStreak}
        longestStreak={streaks.longestStreak}
        totalDays={streaks.totalActiveDays}
      />

      {/* Achievements */}
      <AchievementBadges
        achievements={achievements}
        unlockedCount={unlockedAchievements}
        totalCount={totalAchievements}
      />
    </div>
  );
}
