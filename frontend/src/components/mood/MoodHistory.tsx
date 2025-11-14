'use client';

import { useMood } from '@/hooks/useMood';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import { Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { EnergyLevel } from '@/types';

const energyIcons: Record<EnergyLevel, React.ReactNode> = {
  low: <TrendingDown className="h-4 w-4 text-red-600" />,
  neutral: <Minus className="h-4 w-4 text-yellow-600" />,
  high: <TrendingUp className="h-4 w-4 text-green-600" />,
};

const energyVariants: Record<EnergyLevel, 'danger' | 'warning' | 'success'> = {
  low: 'danger',
  neutral: 'warning',
  high: 'success',
};

export function MoodHistory() {
  const { moodHistory, isLoadingHistory } = useMood();

  if (isLoadingHistory) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Mood Check-ins</CardTitle>
        </CardHeader>
        <CardContent>
          <Loading text="Loading history..." />
        </CardContent>
      </Card>
    );
  }

  if (!moodHistory || moodHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Mood Check-ins</CardTitle>
          <CardDescription>Your mood history will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">
            No mood check-ins yet. Start tracking your energy to see patterns!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Mood Check-ins</CardTitle>
        <CardDescription>
          Last 7 days of energy tracking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {moodHistory.map((log) => (
            <div
              key={log.id}
              className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {energyIcons[log.energy_level as EnergyLevel]}
                  <Badge variant={energyVariants[log.energy_level as EnergyLevel]}>
                    {log.energy_level}
                  </Badge>
                  {log.mood_category && (
                    <Badge variant="default">{log.mood_category}</Badge>
                  )}
                </div>
                {log.context && (
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {log.context}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 ml-4">
                <Clock className="h-3 w-3" />
                {formatDateTime(log.timestamp)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
