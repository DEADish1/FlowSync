'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';

interface ProductivityScoreCardProps {
  score: number;
  completionRate: number;
  totalTasks: number;
  completedTasks: number;
  trend?: 'improving' | 'declining' | 'stable';
  percentageChange?: number;
}

export function ProductivityScoreCard({
  score,
  completionRate,
  totalTasks,
  completedTasks,
  trend,
  percentageChange,
}: ProductivityScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  const getTrendIcon = () => {
    if (trend === 'improving') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'declining') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getTrendText = () => {
    if (!trend || !percentageChange) return null;

    const absChange = Math.abs(percentageChange);
    if (trend === 'improving') {
      return <span className="text-green-600">+{absChange}% from last week</span>;
    } else if (trend === 'declining') {
      return <span className="text-red-600">-{absChange}% from last week</span>;
    }
    return <span className="text-gray-500">No change from last week</span>;
  };

  // Calculate circle progress
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card className="shadow-soft border-purple-aura/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-aura" />
          Productivity Score
        </CardTitle>
        <CardDescription>Based on your last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-6">
          {/* Circular progress */}
          <div className="relative w-32 h-32 shrink-0">
            <svg className="transform -rotate-90 w-32 h-32">
              {/* Background circle */}
              <circle
                cx="64"
                cy="64"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              {/* Progress circle */}
              <circle
                cx="64"
                cy="64"
                r="45"
                stroke="url(#scoreGradient)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              {/* Gradient definition */}
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" className={`${getScoreGradient(score)} stop-color`} />
                  <stop offset="100%" className={`${getScoreGradient(score)} stop-color`} />
                </linearGradient>
              </defs>
            </svg>
            {/* Score text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</div>
                <div className="text-xs text-gray-500">/ 100</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {completionRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-electric-blue to-purple-aura h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(completionRate, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2 bg-light-glow dark:bg-gray-800 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
                <div className="text-lg font-bold text-green-600">{completedTasks}</div>
              </div>
              <div className="p-2 bg-light-glow dark:bg-gray-800 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{totalTasks}</div>
              </div>
            </div>

            {trend && percentageChange !== undefined && (
              <div className="flex items-center gap-2 text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                {getTrendIcon()}
                {getTrendText()}
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-4 p-3 bg-purple-aura/10 rounded-lg border border-purple-aura/20">
          <p className="text-xs text-gray-700 dark:text-gray-300">
            {score >= 80 && (
              <><span className="font-semibold text-purple-aura">Excellent!</span> You're crushing it. Keep up the momentum!</>
            )}
            {score >= 60 && score < 80 && (
              <><span className="font-semibold text-purple-aura">Good work!</span> Focus on completing tasks on time to boost your score.</>
            )}
            {score < 60 && (
              <><span className="font-semibold text-purple-aura">Keep going!</span> Try breaking tasks into smaller pieces for quick wins.</>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
