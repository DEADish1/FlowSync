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

  // Ask question mutation
  const askQuestionMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await coachAPI.askQuestion(question);
      return response.data.answer as string;
    },
  });

  return {
    insights,
    dailyTip,
    isLoadingInsights,
    isLoadingTip,
    refetchInsights,
    askQuestion: askQuestionMutation.mutateAsync,
    isAsking: askQuestionMutation.isPending,
    answer: askQuestionMutation.data,
  };
}
