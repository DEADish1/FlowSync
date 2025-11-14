'use client';

import { EnergyHeatmap } from '@/components/energy/EnergyHeatmap';
import { BestTimes } from '@/components/energy/BestTimes';

export default function EnergyPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Energy Map</h1>
        <p className="mt-2 text-gray-600">
          Visualize your energy patterns throughout the week.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <EnergyHeatmap />
        </div>
        <div>
          <BestTimes />
        </div>
      </div>
    </div>
  );
}
