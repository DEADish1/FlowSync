'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Lock } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
  requirement: number;
}

interface AchievementBadgesProps {
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
}

export function AchievementBadges({
  achievements,
  unlockedCount,
  totalCount,
}: AchievementBadgesProps) {
  const isUnlocked = (achievement: Achievement) => achievement.unlockedAt !== undefined;
  const progressPercentage = (achievement: Achievement) =>
    ((achievement.progress || 0) / achievement.requirement) * 100;

  // Sort: unlocked first, then by progress
  const sortedAchievements = [...achievements].sort((a, b) => {
    if (isUnlocked(a) && !isUnlocked(b)) return -1;
    if (!isUnlocked(a) && isUnlocked(b)) return 1;
    return (b.progress || 0) - (a.progress || 0);
  });

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-purple-aura" />
              Achievements
            </CardTitle>
            <CardDescription>Your FlowSync milestones</CardDescription>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {unlockedCount} / {totalCount}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {((unlockedCount / totalCount) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-electric-blue to-purple-aura h-3 rounded-full transition-all duration-500"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* Achievement grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedAchievements.map((achievement) => {
            const unlocked = isUnlocked(achievement);
            const progress = progressPercentage(achievement);

            return (
              <div
                key={achievement.id}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  unlocked
                    ? 'border-purple-aura/50 bg-gradient-to-br from-purple-aura/10 to-electric-blue/10 shadow-soft'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={`text-4xl ${
                      unlocked ? 'grayscale-0' : 'grayscale opacity-50'
                    }`}
                  >
                    {achievement.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4
                        className={`font-semibold ${
                          unlocked
                            ? 'text-gray-900 dark:text-gray-100'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {achievement.name}
                      </h4>
                      {unlocked && (
                        <Badge variant="default" className="bg-purple-aura text-white text-xs">
                          Unlocked
                        </Badge>
                      )}
                      {!unlocked && (
                        <Lock className="h-3 w-3 text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {achievement.description}
                    </p>

                    {/* Progress bar (only for locked achievements) */}
                    {!unlocked && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">
                            {achievement.progress || 0} / {achievement.requirement}
                          </span>
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {progress.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-electric-blue to-purple-aura h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Unlock date */}
                    {unlocked && achievement.unlockedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {achievements.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Start completing tasks to unlock achievements!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
