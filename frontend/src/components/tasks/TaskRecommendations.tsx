'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Clock, Zap } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimated_duration?: number;
  energy_requirement?: 'low' | 'neutral' | 'high';
  status: string;
}

interface TaskRecommendationsProps {
  tasks: Task[];
  currentEnergy: 'low' | 'neutral' | 'high';
  onSelectTask?: (taskId: number) => void;
}

const energyTaskMatch = {
  high: {
    recommended: ['hard', 'medium'],
    label: 'High Energy',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    message: 'Perfect time to tackle your most challenging tasks',
  },
  neutral: {
    recommended: ['medium', 'easy'],
    label: 'Neutral Energy',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    message: 'Good for moderate difficulty tasks and creative work',
  },
  low: {
    recommended: ['easy'],
    label: 'Low Energy',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    message: 'Focus on simple tasks to maintain momentum',
  },
};

const difficultyConfig = {
  easy: {
    label: 'Easy',
    color: 'bg-green-500',
    textColor: 'text-green-700 dark:text-green-400',
  },
  medium: {
    label: 'Medium',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700 dark:text-yellow-400',
  },
  hard: {
    label: 'Hard',
    color: 'bg-red-500',
    textColor: 'text-red-700 dark:text-red-400',
  },
};

export function TaskRecommendations({
  tasks,
  currentEnergy,
  onSelectTask,
}: TaskRecommendationsProps) {
  const energyConfig = energyTaskMatch[currentEnergy];

  // Filter and rank tasks
  const recommendedTasks = tasks
    .filter(task => task.status === 'pending')
    .map(task => {
      let score = 0;

      // Perfect match: energy requirement matches current energy
      if (task.energy_requirement === currentEnergy) {
        score += 100;
      }

      // Good match: difficulty is recommended for current energy
      if (energyConfig.recommended.includes(task.difficulty)) {
        score += 50;
      }

      // Bonus for shorter tasks (easier to complete)
      if (task.estimated_duration && task.estimated_duration <= 30) {
        score += 20;
      }

      return { ...task, matchScore: score };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5); // Top 5 recommendations

  const topMatches = recommendedTasks.filter(t => t.matchScore >= 50);
  const otherTasks = recommendedTasks.filter(t => t.matchScore < 50);

  const formatDuration = (minutes?: number) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (recommendedTasks.length === 0) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-aura" />
            Task Recommendations
          </CardTitle>
          <CardDescription>No pending tasks to recommend</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>All caught up! Create new tasks to get personalized recommendations.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft border-purple-aura/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-aura" />
          Recommended for You
        </CardTitle>
        <CardDescription>
          Based on your{' '}
          <span className={`font-semibold ${energyConfig.color}`}>{energyConfig.label}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Energy status message */}
        <div className={`p-3 rounded-lg ${energyConfig.bgColor} border border-current/20`}>
          <p className={`text-sm font-medium ${energyConfig.color} flex items-center gap-2`}>
            <TrendingUp className="h-4 w-4" />
            {energyConfig.message}
          </p>
        </div>

        {/* Top matches */}
        {topMatches.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Zap className="h-4 w-4 text-electric-blue" />
              Perfect Matches
            </h4>
            {topMatches.map(task => {
              const difficulty = difficultyConfig[task.difficulty];
              const duration = formatDuration(task.estimated_duration);

              return (
                <div
                  key={task.id}
                  className="group p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-electric-blue hover:shadow-soft transition-all cursor-pointer bg-white dark:bg-gray-800"
                  onClick={() => onSelectTask?.(task.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-electric-blue transition-colors">
                        {task.title}
                      </h5>
                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${difficulty.color}`} />
                          <span className={`text-xs font-medium ${difficulty.textColor}`}>
                            {difficulty.label}
                          </span>
                        </div>
                        {duration && (
                          <>
                            <span className="text-gray-300">•</span>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              {duration}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {task.matchScore >= 150 ? 'Perfect' : 'Good Match'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Other recommendations */}
        {otherTasks.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Other Options
            </h4>
            {otherTasks.map(task => {
              const difficulty = difficultyConfig[task.difficulty];
              const duration = formatDuration(task.estimated_duration);

              return (
                <div
                  key={task.id}
                  className="group p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer"
                  onClick={() => onSelectTask?.(task.id)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {task.title}
                      </h5>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${difficulty.color}`} />
                          <span className="text-xs text-gray-500">{difficulty.label}</span>
                        </div>
                        {duration && (
                          <>
                            <span className="text-gray-300 text-xs">•</span>
                            <span className="text-xs text-gray-500">{duration}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action hint */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            Click a task to start working on it, or generate a full schedule for the day
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
