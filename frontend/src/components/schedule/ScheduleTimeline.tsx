'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap, CheckCircle2 } from 'lucide-react';

interface ScheduledTask {
  id: number;
  task_id: number;
  task_title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  scheduled_start: string;
  scheduled_end: string;
  flow_block_type?: string;
  status: string;
}

interface ScheduleTimelineProps {
  scheduledTasks: ScheduledTask[];
  currentTime?: Date;
}

const energyColors = {
  low: 'bg-blue-100 border-blue-300 text-blue-800',
  neutral: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  high: 'bg-green-100 border-green-300 text-green-800',
};

const difficultyMap = {
  easy: { energy: 'low', label: 'Easy', color: 'bg-green-500' },
  medium: { energy: 'neutral', label: 'Medium', color: 'bg-yellow-500' },
  hard: { energy: 'high', label: 'Hard', color: 'bg-red-500' },
};

const flowBlockLabels: Record<string, string> = {
  'power-focus': 'Power Focus',
  'creative-block': 'Creative Block',
  'chill-reset': 'Chill & Reset',
  'grind-mode': 'Grind Mode',
  'recovery': 'Recovery',
  'deep-work': 'Deep Work',
};

export function ScheduleTimeline({ scheduledTasks, currentTime = new Date() }: ScheduleTimelineProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const minutes = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
    return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`;
  };

  const isCurrentTask = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return currentTime >= startDate && currentTime <= endDate;
  };

  const isPastTask = (end: string) => {
    const endDate = new Date(end);
    return currentTime > endDate;
  };

  if (!scheduledTasks || scheduledTasks.length === 0) {
    return (
      <Card className="shadow-soft">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Clock className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 text-center">No tasks scheduled yet.</p>
          <p className="text-sm text-gray-400 mt-2">Generate a schedule to see your optimized timeline</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {scheduledTasks.map((task, index) => {
        const isCurrent = isCurrentTask(task.scheduled_start, task.scheduled_end);
        const isPast = isPastTask(task.scheduled_end);
        const difficulty = difficultyMap[task.difficulty];

        return (
          <div key={task.id} className="relative">
            {/* Timeline connector */}
            {index < scheduledTasks.length - 1 && (
              <div className="absolute left-6 top-20 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 -mb-4" />
            )}

            <Card
              className={`relative transition-all ${
                isCurrent
                  ? 'shadow-soft-lg border-2 border-electric-blue glow-primary'
                  : isPast
                  ? 'opacity-60'
                  : 'shadow-soft hover:shadow-soft-lg'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Time indicator */}
                  <div className="flex flex-col items-center min-w-[80px]">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isCurrent
                          ? 'bg-gradient-to-br from-electric-blue to-purple-aura text-white animate-pulse-slow'
                          : isPast
                          ? 'bg-gray-200 dark:bg-gray-700'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      {isCurrent ? (
                        <Zap className="h-6 w-6" />
                      ) : isPast ? (
                        <CheckCircle2 className="h-6 w-6 text-gray-500" />
                      ) : (
                        <Clock className="h-6 w-6 text-gray-500" />
                      )}
                    </div>
                    <span className="text-xs font-medium mt-2 text-gray-600 dark:text-gray-400">
                      {formatTime(task.scheduled_start)}
                    </span>
                  </div>

                  {/* Task content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                        {task.task_title}
                      </h3>
                      <Badge
                        variant={isPast ? 'default' : 'secondary'}
                        className="shrink-0"
                      >
                        {getDuration(task.scheduled_start, task.scheduled_end)}
                      </Badge>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {/* Difficulty badge */}
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-sm">
                        <div className={`w-2 h-2 rounded-full ${difficulty.color}`} />
                        <span className="text-gray-700 dark:text-gray-300">{difficulty.label}</span>
                      </div>

                      {/* Flow block badge */}
                      {task.flow_block_type && (
                        <Badge variant="outline" className="gradient-primary-hover">
                          <Zap className="h-3 w-3 mr-1" />
                          {flowBlockLabels[task.flow_block_type] || task.flow_block_type}
                        </Badge>
                      )}

                      {/* Current task indicator */}
                      {isCurrent && (
                        <Badge className="bg-electric-blue text-white">
                          Active Now
                        </Badge>
                      )}
                    </div>

                    {/* Time range */}
                    <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>
                        {formatTime(task.scheduled_start)} - {formatTime(task.scheduled_end)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
