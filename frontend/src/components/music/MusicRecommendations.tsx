'use client';

import { useState } from 'react';
import { useMusic } from '@/hooks/useMusic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Loading } from '@/components/ui/loading';
import { Music, ExternalLink, Sparkles } from 'lucide-react';

const moodOptions = [
  { value: 'stressed', label: 'Stressed' },
  { value: 'calm', label: 'Calm' },
  { value: 'excited', label: 'Excited' },
  { value: 'tired', label: 'Tired' },
  { value: 'focused', label: 'Focused' },
  { value: 'neutral', label: 'Neutral' },
];

const energyOptions = [
  { value: 'low', label: 'Low Energy' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'high', label: 'High Energy' },
];

export function MusicRecommendations() {
  const {
    recommendations,
    isLoading,
    mood,
    energy,
    setMood,
    setEnergy,
    fetchRecommendations,
  } = useMusic();

  const handleFetch = () => {
    fetchRecommendations();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Music Recommendations
        </CardTitle>
        <CardDescription>
          Find the perfect playlist for your current mood and task
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Mood"
            options={moodOptions}
            value={mood}
            onChange={(e) => setMood(e.target.value)}
          />
          <Select
            label="Energy Level"
            options={energyOptions}
            value={energy}
            onChange={(e) => setEnergy(e.target.value)}
          />
        </div>

        <Button onClick={handleFetch} disabled={isLoading} className="w-full">
          {isLoading ? 'Finding Playlists...' : 'Get Recommendations'}
        </Button>

        {isLoading && (
          <Loading text="Searching for the perfect playlists..." />
        )}

        {recommendations && recommendations.length > 0 && (
          <div className="space-y-3 pt-4">
            <h3 className="font-medium text-gray-900">Recommended Playlists</h3>
            {recommendations.map((playlist: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100 hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{playlist.name}</h4>
                  {playlist.description && (
                    <p className="text-sm text-gray-600 mt-1">{playlist.description}</p>
                  )}
                </div>
                {playlist.external_urls?.spotify && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(playlist.external_urls.spotify, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {recommendations && recommendations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No playlists found. Try different mood/energy settings.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
