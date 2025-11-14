'use client';

import { MoodInput } from '@/components/mood/MoodInput';
import { MoodHistory } from '@/components/mood/MoodHistory';

export default function MoodPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mood Check-in</h1>
        <p className="mt-2 text-gray-600">
          Tell us how you're feeling and we'll optimize your schedule.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MoodInput />
        <MoodHistory />
      </div>
    </div>
  );
}
