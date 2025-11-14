'use client';

import { MusicRecommendations } from '@/components/music/MusicRecommendations';
import { SunoPrompt } from '@/components/music/SunoPrompt';

export default function MusicPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Music</h1>
        <p className="mt-2 text-gray-600">
          Personalized music recommendations for your workflow.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <MusicRecommendations />
        </div>
        <div>
          <SunoPrompt />
        </div>
      </div>
    </div>
  );
}
