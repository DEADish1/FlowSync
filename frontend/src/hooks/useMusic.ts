'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { musicAPI } from '@/lib/api';

export function useMusic() {
  const [mood, setMood] = useState('neutral');
  const [energy, setEnergy] = useState('neutral');

  // Get recommendations
  const {
    data: recommendations,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['music-recommendations', mood, energy],
    queryFn: async () => {
      const response = await musicAPI.getRecommendations(mood, energy);
      return response.data.playlists || [];
    },
    enabled: false, // Manual trigger
  });

  // Generate Suno prompt
  const generatePromptMutation = useMutation({
    mutationFn: async (params: { mood: string; energy: string; taskType: string }) => {
      const response = await musicAPI.generateSunoPrompt(
        params.mood,
        params.energy,
        params.taskType
      );
      return response.data.prompt;
    },
  });

  return {
    recommendations,
    isLoading,
    mood,
    energy,
    setMood,
    setEnergy,
    fetchRecommendations: refetch,
    generatePrompt: generatePromptMutation.mutateAsync,
    isGenerating: generatePromptMutation.isPending,
    sunoPrompt: generatePromptMutation.data,
  };
}
