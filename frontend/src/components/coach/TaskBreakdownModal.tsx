'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Clock, Target } from 'lucide-react';

interface TaskBreakdownModalProps {
  trigger?: React.ReactNode;
  onBreakdown: (title: string, description?: string) => Promise<void>;
  isLoading?: boolean;
  breakdown?: {
    subtasks: Array<{
      title: string;
      estimatedDuration: number;
      difficulty: 'easy' | 'medium' | 'hard';
      order: number;
    }>;
    strategy: string;
    estimatedTotalTime: number;
  } | null;
}

const difficultyColors = {
  easy: 'bg-green-500',
  medium: 'bg-yellow-500',
  hard: 'bg-red-500',
};

export function TaskBreakdownModal({
  trigger,
  onBreakdown,
  isLoading = false,
  breakdown,
}: TaskBreakdownModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleBreakdown = async () => {
    if (!title.trim()) return;

    await onBreakdown(title, description || undefined);
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 gradient-primary-hover">
            <Sparkles className="h-4 w-4" />
            Break Down Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-aura" />
            AI Task Breakdown
          </DialogTitle>
          <DialogDescription>
            Let AI break down your complex task into manageable subtasks
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Input Form */}
          {!breakdown && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Task Title *
                </label>
                <Input
                  placeholder="e.g., Complete project proposal"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Description (optional)
                </label>
                <Textarea
                  placeholder="Add any additional context or requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              <Button
                onClick={handleBreakdown}
                disabled={!title.trim() || isLoading}
                className="w-full gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Breaking down task...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Breakdown
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Breakdown Results */}
          {breakdown && (
            <div className="space-y-6">
              {/* Strategy */}
              <div className="p-4 bg-light-glow dark:bg-purple-aura/10 rounded-lg border border-purple-aura/20">
                <h4 className="text-sm font-semibold text-purple-aura mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Recommended Strategy
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">{breakdown.strategy}</p>
              </div>

              {/* Total Time */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Estimated Total Time
                </span>
                <Badge variant="secondary" className="text-base px-3 py-1">
                  <Clock className="h-4 w-4 mr-1" />
                  {Math.floor(breakdown.estimatedTotalTime / 60)}h{' '}
                  {breakdown.estimatedTotalTime % 60}m
                </Badge>
              </div>

              {/* Subtasks */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Subtasks ({breakdown.subtasks.length})
                </h4>
                <div className="space-y-3">
                  {breakdown.subtasks
                    .sort((a, b) => a.order - b.order)
                    .map((subtask, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-electric-blue hover:shadow-soft transition-all"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-electric-blue/10 text-electric-blue font-semibold text-sm shrink-0">
                          {subtask.order}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                            {subtask.title}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {subtask.estimatedDuration} min
                            </Badge>
                            <div className="flex items-center gap-1.5">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  difficultyColors[subtask.difficulty]
                                }`}
                              />
                              <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                                {subtask.difficulty}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={handleReset} className="flex-1">
                  Try Another Task
                </Button>
                <Button onClick={() => setOpen(false)} className="flex-1">
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
