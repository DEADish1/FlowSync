'use client';

import { EnergyHeatmap } from '@/components/energy/EnergyHeatmap';
import { BestTimes } from '@/components/energy/BestTimes';
import { EnergyTrendChart } from '@/components/energy/EnergyTrendChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo } from 'react';

export default function EnergyPage() {
  // Mock data for trend chart (will be replaced with real data from API)
  const trendData = useMemo(() => {
    const days = 14;
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      return {
        date: date.toISOString(),
        energy: 0.3 + Math.random() * 0.6, // Random energy between 0.3 and 0.9
      };
    });
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Energy Map</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Visualize your energy patterns throughout the week.
        </p>
      </div>

      {/* Energy Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Energy Trend (Last 14 Days)</CardTitle>
          <CardDescription>Track how your energy levels have changed over time</CardDescription>
        </CardHeader>
        <CardContent>
          <EnergyTrendChart data={trendData} days={14} />
        </CardContent>
      </Card>

      {/* Energy Heatmap and Best Times */}
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
