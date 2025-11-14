'use client';

import { FlowBlock } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Zap } from 'lucide-react';

interface FlowBlockCardProps {
  block: FlowBlock;
  onStart: (block: FlowBlock) => void;
  disabled?: boolean;
}

const blockIcons: Record<string, string> = {
  'power-focus': '⚡',
  'creative-block': '🎨',
  'chill-reset': '😌',
  'grind-mode': '💪',
  'recovery': '🧘',
  'deep-work': '🎯',
};

const intensityColor = (level: number) => {
  if (level >= 8) return 'danger';
  if (level >= 5) return 'warning';
  return 'success';
};

export function FlowBlockCard({ block, onStart, disabled }: FlowBlockCardProps) {
  return (
    <Card className={`hover:shadow-lg transition-shadow ${disabled ? 'opacity-50' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{blockIcons[block.type] || '⏱️'}</div>
            <div>
              <CardTitle className="text-lg">{block.name}</CardTitle>
              <CardDescription>{block.duration} minutes</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{block.description}</p>

        <div className="flex flex-wrap gap-2">
          <Badge variant={intensityColor(block.settings.intensityLevel)}>
            Intensity: {block.settings.intensityLevel}/10
          </Badge>
          {block.settings.breakReminders && (
            <Badge variant="info">Break Reminders</Badge>
          )}
          {!block.settings.allowInterruptions && (
            <Badge variant="warning">No Interruptions</Badge>
          )}
        </div>

        <Button
          onClick={() => onStart(block)}
          className="w-full"
          disabled={disabled}
        >
          <Play className="h-4 w-4 mr-2" />
          Start {block.name}
        </Button>
      </CardContent>
    </Card>
  );
}
