'use client';

import { useMood } from '@/hooks/useMood';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function BestTimes() {
  const { energyPatterns } = useMood();

  if (!energyPatterns || energyPatterns.length === 0) {
    return null;
  }

  // Get top 5 best times
  const bestTimes = [...energyPatterns]
    .sort((a: any, b: any) => b.avg_energy_level - a.avg_energy_level)
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Your Best Times
        </CardTitle>
        <CardDescription>
          When you typically have the most energy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bestTimes.map((time: any, index: number) => (
            <div
              key={`${time.day_of_week}-${time.hour_of_day}`}
              className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {DAYS[time.day_of_week]}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {time.hour_of_day}:00 - {time.hour_of_day + 1}:00
                  </div>
                </div>
              </div>
              <Badge variant="success">
                {Math.round(time.avg_energy_level * 100)}% energy
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
