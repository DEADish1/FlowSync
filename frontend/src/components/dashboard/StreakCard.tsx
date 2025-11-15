'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Flame, Trophy, Target } from 'lucide-react';

interface StreakCardProps {
  currentStreak?: number;
  longestStreak?: number;
  totalDays?: number;
}

export function StreakCard({
  currentStreak = 0,
  longestStreak = 0,
  totalDays = 0,
}: StreakCardProps) {
  const streakDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    // Mock data - replace with real data from API
    const hasActivity = i <= currentStreak;
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate(),
      hasActivity,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className={`h-5 w-5 ${currentStreak > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
          Productivity Streak
        </CardTitle>
        <CardDescription>Keep the momentum going!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Streak */}
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900 dark:text-gray-100">
            {currentStreak}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {currentStreak === 1 ? 'day' : 'days'} streak
          </div>
        </div>

        {/* Week View */}
        <div className="flex justify-between gap-2">
          {streakDays.map((day, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {day.day}
              </div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  day.hasActivity
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                {day.date}
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Trophy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {longestStreak}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Best Streak
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {totalDays}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Total Days
              </div>
            </div>
          </div>
        </div>

        {/* Milestone */}
        {currentStreak > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {currentStreak >= 7
                    ? '🎉 Amazing! Week-long streak!'
                    : currentStreak >= 3
                    ? '🔥 Keep it up!'
                    : '⭐ Great start!'}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {7 - (currentStreak % 7) > 0 &&
                    `${7 - (currentStreak % 7)} more ${7 - (currentStreak % 7) === 1 ? 'day' : 'days'} to next milestone`}
                </div>
              </div>
              <Badge className="bg-orange-500 text-white">
                {currentStreak >= 7 ? 'On Fire 🔥' : 'Active'}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
