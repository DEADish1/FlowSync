'use client';

import { useState } from 'react';
import { useMusic } from '@/hooks/useMusic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Sparkles, Copy } from 'lucide-react';

const taskTypeOptions = [
  { value: 'coding', label: 'Coding' },
  { value: 'writing', label: 'Writing' },
  { value: 'creative', label: 'Creative Work' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'learning', label: 'Learning' },
];

export function SunoPrompt() {
  const { generatePrompt, isGenerating, sunoPrompt } = useMusic();
  const [mood, setMood] = useState('focused');
  const [energy, setEnergy] = useState('neutral');
  const [taskType, setTaskType] = useState('coding');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    await generatePrompt({ mood, energy, taskType });
  };

  const handleCopy = () => {
    if (sunoPrompt) {
      navigator.clipboard.writeText(sunoPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Suno AI Soundscape
        </CardTitle>
        <CardDescription>
          Generate a custom music prompt for Suno AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select
          label="Task Type"
          options={taskTypeOptions}
          value={taskType}
          onChange={(e) => setTaskType(e.target.value)}
        />

        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          isLoading={isGenerating}
          className="w-full"
        >
          Generate Suno Prompt
        </Button>

        {sunoPrompt && (
          <div className="space-y-2">
            <div className="relative">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg font-mono text-sm">
                {sunoPrompt}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="absolute top-2 right-2"
              >
                <Copy className="h-4 w-4 mr-1" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Use this prompt in Suno AI to generate custom productivity music!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
