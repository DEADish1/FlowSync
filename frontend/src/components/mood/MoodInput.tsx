'use client';

import { useState } from 'react';
import { useMood } from '@/hooks/useMood';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { EnergyLevel, MoodCategory } from '@/types';

const energyColors: Record<EnergyLevel, string> = {
  low: 'bg-red-100 text-red-800 border-red-200',
  neutral: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-green-100 text-green-800 border-green-200',
};

const energyIcons: Record<EnergyLevel, React.ReactNode> = {
  low: <TrendingDown className="h-4 w-4" />,
  neutral: <Minus className="h-4 w-4" />,
  high: <TrendingUp className="h-4 w-4" />,
};

const moodColors: Record<MoodCategory, string> = {
  stressed: 'danger',
  calm: 'success',
  excited: 'info',
  tired: 'warning',
  focused: 'success',
  distracted: 'warning',
};

export function MoodInput() {
  const [moodText, setMoodText] = useState('');
  const { analyzeMood, isAnalyzing, lastAnalysis } = useMood();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moodText.trim()) return;

    try {
      await analyzeMood(moodText);
    } catch (error) {
      console.error('Failed to analyze mood:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            How are you feeling?
          </CardTitle>
          <CardDescription>
            Describe your current mood and energy level. Be as detailed as you'd like.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={moodText}
              onChange={(e) => setMoodText(e.target.value)}
              placeholder="I'm feeling a bit tired today, but motivated to get things done. Had a good morning routine..."
              className="min-h-32"
              disabled={isAnalyzing}
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {moodText.length} characters
              </p>
              <Button
                type="submit"
                disabled={isAnalyzing || !moodText.trim()}
                isLoading={isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Mood'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {lastAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Energy Level */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Energy Level</h3>
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  energyColors[lastAnalysis.energyLevel]
                }`}
              >
                {energyIcons[lastAnalysis.energyLevel]}
                <span className="font-semibold capitalize">
                  {lastAnalysis.energyLevel}
                </span>
              </div>
            </div>

            {/* Mood Category */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Mood Category</h3>
              <Badge variant={moodColors[lastAnalysis.moodCategory]} className="text-base px-3 py-1">
                {lastAnalysis.moodCategory}
              </Badge>
            </div>

            {/* Confidence */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Confidence: {lastAnalysis.confidence}%
              </h3>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${lastAnalysis.confidence}%` }}
                />
              </div>
            </div>

            {/* Suggestions */}
            {lastAnalysis.suggestions && lastAnalysis.suggestions.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  AI Suggestions
                </h3>
                <ul className="space-y-2">
                  {lastAnalysis.suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg"
                    >
                      <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
