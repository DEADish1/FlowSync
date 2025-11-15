'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { coachAPI } from '@/lib/api';

export function useCoach() {
  // Get insights
  const {
    data: insights,
    isLoading: isLoadingInsights,
    refetch: refetchInsights,
  } = useQuery({
    queryKey: ['coach-insights'],
    queryFn: async () => {
      const response = await coachAPI.getInsights();
      return response.data.insights as string[];
    },
  });

  // Get daily tip
  const {
    data: dailyTip,
    isLoading: isLoadingTip,
  } = useQuery({
    queryKey: ['daily-tip'],
    queryFn: async () => {
      const response = await coachAPI.getDailyTip();
      return response.data.tip as string;
    },
  });

  // Get daily briefing
  const {
    data: dailyBriefing,
    isLoading: isLoadingBriefing,
    refetch: refetchBriefing,
  } = useQuery({
    queryKey: ['daily-briefing'],
    queryFn: async () => {
      const response = await coachAPI.getDailyBriefing();
      return response.data as {
        greeting: string;
        energyForecast: string;
        topPriorities: string[];
        recommendations: string[];
        motivationalQuote: string;
      };
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });

  // Ask question mutation
  const askQuestionMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await coachAPI.askQuestion(question);
      return response.data.answer as string;
    },
  });

  // Breakdown task mutation
  const breakdownTaskMutation = useMutation({
    mutationFn: async (params: { title: string; description?: string }) => {
      const response = await coachAPI.breakdownTask(params.title, params.description);
      return response.data as {
        subtasks: Array<{
          title: string;
          estimatedDuration: number;
          difficulty: 'easy' | 'medium' | 'hard';
          order: number;
        }>;
        strategy: string;
        estimatedTotalTime: number;
      };
    },
  });

  return {
    insights,
    dailyTip,
    dailyBriefing,
    isLoadingInsights,
    isLoadingTip,
    isLoadingBriefing,
    refetchInsights,
    refetchBriefing,
    askQuestion: askQuestionMutation.mutateAsync,
    isAsking: askQuestionMutation.isPending,
    answer: askQuestionMutation.data,
    breakdownTask: breakdownTaskMutation.mutateAsync,
    isBreakingDown: breakdownTaskMutation.isPending,
    breakdown: breakdownTaskMutation.data,
  };
}
