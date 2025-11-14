'use client';

import { useFlowBlock } from '@/hooks/useFlowBlock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pause, Play, Square } from 'lucide-react';

export function ActiveTimer() {
  const {
    activeBlockType,
    timeRemaining,
    isRunning,
    isPaused,
    formatTime,
    getProgress,
    pause,
    resume,
    stop,
  } = useFlowBlock();

  if (!activeBlockType) {
    return null;
  }

  const progress = getProgress();

  return (
    <Card className="border-2 border-blue-500 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="capitalize">{activeBlockType.replace('-', ' ')}</span>
          {isRunning && (
            <span className="text-sm font-normal text-green-600">Active</span>
          )}
          {isPaused && (
            <span className="text-sm font-normal text-yellow-600">Paused</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="text-center">
          <div className="text-6xl font-bold text-gray-900 tabular-nums">
            {formatTime(timeRemaining)}
          </div>
          <p className="text-sm text-gray-500 mt-2">Time Remaining</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {isRunning ? (
            <Button onClick={pause} variant="outline" className="flex-1">
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          ) : (
            <Button onClick={resume} variant="primary" className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
          )}
          <Button onClick={stop} variant="danger" className="flex-1">
            <Square className="h-4 w-4 mr-2" />
            Stop
          </Button>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-900">
            💡 Stay focused! Minimize distractions and give this block your full attention.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
