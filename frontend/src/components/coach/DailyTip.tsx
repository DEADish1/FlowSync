'use client';

import { useCoach } from '@/hooks/useCoach';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { Sparkles } from 'lucide-react';

export function DailyTip() {
  const { dailyTip, isLoadingTip } = useCoach();

  return (
    <Card className="border-2 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-900">
          <Sparkles className="h-5 w-5" />
          Daily Tip
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingTip ? (
          <Loading size="sm" />
        ) : (
          <p className="text-gray-700">
            {dailyTip || 'Check back tomorrow for your daily productivity tip!'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
