'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { moodAPI } from '@/lib/api';
import { useMoodStore } from '@/store/moodStore';
import { MoodAnalysis, EnergyLog } from '@/types';

export function useMood() {
  const { currentEnergy, currentMood, lastAnalysis, setLastAnalysis } = useMoodStore();

  // Analyze mood mutation
  const analyzeMoodMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await moodAPI.analyze(text);
      return response.data as MoodAnalysis;
    },
    onSuccess: (data) => {
      setLastAnalysis(data);
    },
  });

  // Log energy mutation
  const logEnergyMutation = useMutation({
    mutationFn: async (data: {
      energyLevel: string;
      moodCategory?: string;
      context?: string;
    }) => {
      const response = await moodAPI.log(
        data.energyLevel,
        data.moodCategory,
        data.context
      );
      return response.data;
    },
  });

  // Get mood history
  const {
    data: moodHistory,
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ['mood-history'],
    queryFn: async () => {
      const response = await moodAPI.getHistory(7);
      return response.data.logs as EnergyLog[];
    },
  });

  // Get energy patterns
  const {
    data: energyPatterns,
    isLoading: isLoadingPatterns,
  } = useQuery({
    queryKey: ['energy-patterns'],
    queryFn: async () => {
      const response = await moodAPI.getPatterns();
      return response.data.patterns;
    },
  });

  const analyzeMood = async (text: string) => {
    return analyzeMoodMutation.mutateAsync(text);
  };

  const logEnergy = async (
    energyLevel: string,
    moodCategory?: string,
    context?: string
  ) => {
    return logEnergyMutation.mutateAsync({ energyLevel, moodCategory, context });
  };

  return {
    currentEnergy,
    currentMood,
    lastAnalysis,
    moodHistory,
    energyPatterns,
    isLoadingHistory,
    isLoadingPatterns,
    analyzeMood,
    logEnergy,
    isAnalyzing: analyzeMoodMutation.isPending,
    isLogging: logEnergyMutation.isPending,
    analyzeError: analyzeMoodMutation.error,
    refetchHistory,
  };
}
