'use client';

import { useCoach } from '@/hooks/useCoach';
import { DailyTip } from '@/components/coach/DailyTip';
import { InsightsList } from '@/components/coach/InsightsList';
import { AskCoach } from '@/components/coach/AskCoach';
import { DailyBriefingCard } from '@/components/coach/DailyBriefingCard';
import { TaskBreakdownModal } from '@/components/coach/TaskBreakdownModal';

export default function CoachPage() {
  const { dailyBriefing, isLoadingBriefing, refetchBriefing, breakdownTask, isBreakingDown, breakdown } = useCoach();

  const handleBreakdownTask = async (title: string, description?: string) => {
    await breakdownTask({ title, description });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">AI Productivity Coach</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Get personalized insights and recommendations powered by AI
          </p>
        </div>
        <TaskBreakdownModal
          onBreakdown={handleBreakdownTask}
          isLoading={isBreakingDown}
          breakdown={breakdown}
        />
      </div>

      {/* Daily Briefing */}
      {dailyBriefing && (
        <DailyBriefingCard
          greeting={dailyBriefing.greeting}
          energyForecast={dailyBriefing.energyForecast}
          topPriorities={dailyBriefing.topPriorities}
          recommendations={dailyBriefing.recommendations}
          motivationalQuote={dailyBriefing.motivationalQuote}
          onRefresh={refetchBriefing}
          isLoading={isLoadingBriefing}
        />
      )}

      <DailyTip />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <InsightsList />
        </div>
        <div>
          <AskCoach />
        </div>
      </div>
    </div>
  );
}
