'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSchedule } from '@/hooks/useSchedule';
import { useMood } from '@/hooks/useMood';
import { ScheduleTimeline } from '@/components/schedule/ScheduleTimeline';
import { EnergySlots } from '@/components/schedule/EnergySlots';
import { Sparkles, RefreshCw, Calendar, Activity } from 'lucide-react';

export default function SchedulePage() {
  const { schedule, isLoading, generateSchedule, reshuffleSchedule } = useSchedule();
  const { currentEnergy } = useMood();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReshuffling, setIsReshuffling] = useState(false);

  const handleGenerateSchedule = async () => {
    setIsGenerating(true);
    await generateSchedule();
    setIsGenerating(false);
  };

  const handleReshuffleSchedule = async () => {
    if (!currentEnergy) {
      alert('Please check your energy level first on the Mood page');
      return;
    }

    setIsReshuffling(true);
    await reshuffleSchedule(currentEnergy);
    setIsReshuffling(false);
  };

  const hasSchedule = schedule && schedule.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient">Smart Schedule</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Energy-optimized schedule designed for your natural rhythm.
        </p>
      </div>

      {/* Current energy status */}
      {currentEnergy && (
        <Card className="border-2 border-electric-blue/30 bg-gradient-to-br from-light-glow to-electric-blue/5 shadow-soft">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-electric-blue to-purple-aura flex items-center justify-center">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Energy</p>
                  <p className="text-xl font-bold capitalize text-gray-900 dark:text-gray-100">
                    {currentEnergy}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleReshuffleSchedule}
                disabled={isReshuffling || !hasSchedule}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isReshuffling ? 'animate-spin' : ''}`} />
                Reshuffle for my energy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Schedule Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Action buttons */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-electric-blue" />
                Today's Schedule
              </CardTitle>
              <CardDescription>
                {hasSchedule
                  ? `${schedule.length} tasks scheduled for optimal productivity`
                  : 'Generate your personalized schedule'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button
                  onClick={handleGenerateSchedule}
                  disabled={isGenerating}
                  className="gap-2 gradient-primary-hover"
                >
                  <Sparkles className={`h-4 w-4 ${isGenerating ? 'animate-pulse' : ''}`} />
                  {hasSchedule ? 'Regenerate Schedule' : 'Generate Smart Schedule'}
                </Button>

                {hasSchedule && (
                  <Badge variant="secondary" className="px-3 py-2">
                    {schedule.length} {schedule.length === 1 ? 'task' : 'tasks'}
                  </Badge>
                )}
              </div>

              {!hasSchedule && (
                <div className="mt-4 p-4 bg-light-glow dark:bg-purple-aura/10 rounded-lg border border-purple-aura/20">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold text-purple-aura">How it works:</span> We analyze
                    your energy patterns and task requirements to create an optimized schedule that
                    matches complex tasks with your high-energy periods.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <ScheduleTimeline scheduledTasks={schedule} />
        </div>

        {/* Sidebar - Energy Patterns */}
        <div className="space-y-6">
          <EnergySlots />

          {/* Tips Card */}
          <Card className="shadow-soft border-purple-aura/20">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2 text-purple-aura">
                <Sparkles className="h-4 w-4" />
                Smart Scheduling Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex gap-2">
                <span className="text-electric-blue font-bold">•</span>
                <p>Hard tasks are scheduled during high-energy periods</p>
              </div>
              <div className="flex gap-2">
                <span className="text-electric-blue font-bold">•</span>
                <p>Easy tasks fill low-energy times to maintain momentum</p>
              </div>
              <div className="flex gap-2">
                <span className="text-electric-blue font-bold">•</span>
                <p>Flow blocks are suggested to help you stay focused</p>
              </div>
              <div className="flex gap-2">
                <span className="text-electric-blue font-bold">•</span>
                <p>Reshuffle anytime if your energy changes</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
