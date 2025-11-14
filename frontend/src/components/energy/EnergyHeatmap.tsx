'use client';

import { useMood } from '@/hooks/useMood';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { Select } from '@/components/ui/select';
import { useState } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const getEnergyColor = (value: number) => {
  if (value >= 0.7) return 'bg-green-500 hover:bg-green-600';
  if (value >= 0.4) return 'bg-yellow-500 hover:bg-yellow-600';
  if (value > 0) return 'bg-red-500 hover:bg-red-600';
  return 'bg-gray-100 hover:bg-gray-200';
};

const getEnergyLabel = (value: number) => {
  if (value >= 0.7) return 'High Energy';
  if (value >= 0.4) return 'Neutral Energy';
  if (value > 0) return 'Low Energy';
  return 'No Data';
};

export function EnergyHeatmap() {
  const { energyPatterns, isLoadingPatterns } = useMood();
  const [selectedPeriod, setSelectedPeriod] = useState('7');

  // Transform patterns into 7x24 grid
  const getEnergyValue = (day: number, hour: number): number => {
    if (!energyPatterns) return 0;

    const pattern = energyPatterns.find(
      (p: any) => p.day_of_week === day && p.hour_of_day === hour
    );

    return pattern ? parseFloat(pattern.avg_energy_level) : 0;
  };

  if (isLoadingPatterns) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Energy Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <Loading text="Loading energy patterns..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Energy Heatmap</CardTitle>
            <CardDescription>
              Your energy levels throughout the week
            </CardDescription>
          </div>
          <Select
            options={[
              { value: '7', label: 'Last 7 days' },
              { value: '14', label: 'Last 14 days' },
              { value: '30', label: 'Last 30 days' },
            ]}
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {!energyPatterns || energyPatterns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No energy data yet. Start tracking your mood to see patterns!
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Time labels */}
                <div className="flex">
                  <div className="w-12" /> {/* Spacer for day labels */}
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="w-8 text-xs text-gray-600 text-center flex-shrink-0"
                    >
                      {hour % 3 === 0 ? `${hour}h` : ''}
                    </div>
                  ))}
                </div>

                {/* Heatmap grid */}
                {DAYS.map((day, dayIndex) => (
                  <div key={day} className="flex items-center">
                    <div className="w-12 text-xs font-medium text-gray-700">
                      {day}
                    </div>
                    {HOURS.map((hour) => {
                      const value = getEnergyValue(dayIndex, hour);
                      return (
                        <div
                          key={hour}
                          className="w-8 h-8 flex-shrink-0"
                          title={`${day} ${hour}:00 - ${getEnergyLabel(value)}`}
                        >
                          <div
                            className={`w-7 h-7 rounded transition-all cursor-pointer ${getEnergyColor(
                              value
                            )}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500" />
                <span className="text-sm text-gray-700">High Energy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-500" />
                <span className="text-sm text-gray-700">Neutral</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500" />
                <span className="text-sm text-gray-700">Low Energy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300" />
                <span className="text-sm text-gray-700">No Data</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
