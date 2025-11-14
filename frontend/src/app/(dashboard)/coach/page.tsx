'use client';

import { DailyTip } from '@/components/coach/DailyTip';
import { InsightsList } from '@/components/coach/InsightsList';
import { AskCoach } from '@/components/coach/AskCoach';

export default function CoachPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Productivity Coach</h1>
        <p className="mt-2 text-gray-600">
          Get personalized insights and recommendations.
        </p>
      </div>

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
