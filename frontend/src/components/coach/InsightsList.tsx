'use client';

import { useCoach } from '@/hooks/useCoach';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { Sparkles, RefreshCw } from 'lucide-react';

export function InsightsList() {
  const { insights, isLoadingInsights, refetchInsights } = useCoach();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Personalized Insights</CardTitle>
            <CardDescription>
              AI-powered recommendations based on your patterns
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchInsights()}
            disabled={isLoadingInsights}
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingInsights ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoadingInsights ? (
          <Loading text="Generating insights..." />
        ) : insights && insights.length > 0 ? (
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100"
              >
                <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              Keep tracking your mood and tasks to get personalized insights!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
