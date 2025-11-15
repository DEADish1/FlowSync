'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface EnergySlot {
  hour: number;
  energyLevel: 'low' | 'neutral' | 'high';
  label: string;
}

interface EnergySlotsProps {
  slots?: EnergySlot[];
  currentHour?: number;
}

const energyConfig = {
  high: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    border: 'border-green-300 dark:border-green-700',
    text: 'text-green-700 dark:text-green-400',
    label: 'High Energy',
    height: 'h-16',
  },
  neutral: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    border: 'border-yellow-300 dark:border-yellow-700',
    text: 'text-yellow-700 dark:text-yellow-400',
    label: 'Neutral',
    height: 'h-10',
  },
  low: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    border: 'border-blue-300 dark:border-blue-700',
    text: 'text-blue-700 dark:text-blue-400',
    label: 'Low Energy',
    height: 'h-6',
  },
};

const defaultSlots: EnergySlot[] = [
  { hour: 8, energyLevel: 'neutral', label: '8 AM' },
  { hour: 9, energyLevel: 'high', label: '9 AM' },
  { hour: 10, energyLevel: 'high', label: '10 AM' },
  { hour: 11, energyLevel: 'high', label: '11 AM' },
  { hour: 12, energyLevel: 'neutral', label: '12 PM' },
  { hour: 13, energyLevel: 'low', label: '1 PM' },
  { hour: 14, energyLevel: 'neutral', label: '2 PM' },
  { hour: 15, energyLevel: 'high', label: '3 PM' },
  { hour: 16, energyLevel: 'neutral', label: '4 PM' },
  { hour: 17, energyLevel: 'neutral', label: '5 PM' },
];

export function EnergySlots({ slots = defaultSlots, currentHour }: EnergySlotsProps) {
  const current = currentHour ?? new Date().getHours();

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-electric-blue" />
          Energy Patterns
        </CardTitle>
        <CardDescription>
          Your typical energy levels throughout the day
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Legend */}
          <div className="flex gap-4 text-xs mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            {(['high', 'neutral', 'low'] as const).map((level) => (
              <div key={level} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${energyConfig[level].bg} ${energyConfig[level].border} border`} />
                <span className="text-gray-600 dark:text-gray-400">{energyConfig[level].label}</span>
              </div>
            ))}
          </div>

          {/* Energy bar chart */}
          <div className="space-y-2">
            {slots.map((slot) => {
              const config = energyConfig[slot.energyLevel];
              const isCurrent = current === slot.hour;

              return (
                <div
                  key={slot.hour}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                    isCurrent ? 'bg-electric-blue/10 border border-electric-blue/30' : ''
                  }`}
                >
                  {/* Hour label */}
                  <span className={`text-sm font-medium w-16 ${isCurrent ? 'text-electric-blue' : 'text-gray-600 dark:text-gray-400'}`}>
                    {slot.label}
                  </span>

                  {/* Energy bar */}
                  <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden h-8 relative">
                    <div
                      className={`${config.bg} ${config.border} border-l-4 h-full flex items-center px-3 transition-all duration-500 ${
                        isCurrent ? 'animate-pulse-slow' : ''
                      }`}
                      style={{
                        width:
                          slot.energyLevel === 'high'
                            ? '90%'
                            : slot.energyLevel === 'neutral'
                            ? '60%'
                            : '35%',
                      }}
                    >
                      <span className={`text-xs font-medium ${config.text}`}>
                        {slot.energyLevel === 'high' && 'Best for complex tasks'}
                        {slot.energyLevel === 'neutral' && 'Good for moderate tasks'}
                        {slot.energyLevel === 'low' && 'Focus on easy tasks'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info */}
          <div className="mt-4 p-3 bg-light-glow dark:bg-purple-aura/10 rounded-lg border border-purple-aura/20">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-purple-aura">Tip:</span> Tasks are automatically scheduled during your high-energy periods for better productivity.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
