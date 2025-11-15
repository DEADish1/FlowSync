'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sunrise, Lightbulb, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DailyBriefingCardProps {
  greeting: string;
  energyForecast: string;
  topPriorities: string[];
  recommendations: string[];
  motivationalQuote: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function DailyBriefingCard({
  greeting,
  energyForecast,
  topPriorities,
  recommendations,
  motivationalQuote,
  onRefresh,
  isLoading = false,
}: DailyBriefingCardProps) {
  return (
    <Card className="shadow-soft border-purple-aura/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sunrise className="h-5 w-5 text-electric-blue" />
              Daily Briefing
            </CardTitle>
            <CardDescription>Your personalized productivity forecast</CardDescription>
          </div>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Greeting */}
        <div className="p-4 bg-gradient-to-br from-light-glow to-electric-blue/5 rounded-lg border border-electric-blue/20">
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{greeting}</p>
        </div>

        {/* Energy Forecast */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-purple-aura" />
            Energy Forecast
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {energyForecast}
          </p>
        </div>

        {/* Top Priorities */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            Top Priorities
          </h4>
          <div className="space-y-2">
            {topPriorities.map((priority, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Badge variant="secondary" className="mt-0.5 shrink-0">
                  {index + 1}
                </Badge>
                <p className="text-sm text-gray-700 dark:text-gray-300">{priority}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Recommendations
            </h4>
            <div className="space-y-2">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  <span className="text-electric-blue font-bold">•</span>
                  <p>{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Motivational Quote */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-aura/10 to-electric-blue/10 rounded-lg border border-purple-aura/20">
            <Sparkles className="h-5 w-5 text-purple-aura mt-0.5 shrink-0" />
            <p className="text-sm font-medium italic text-gray-700 dark:text-gray-300">
              "{motivationalQuote}"
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
