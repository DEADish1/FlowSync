'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { flowBlocksAPI } from '@/lib/api';
import { useFlowBlockStore } from '@/store/flowBlockStore';
import { FlowBlock, FlowBlockType } from '@/types';

export function useFlowBlock() {
  const {
    activeBlockType,
    timeRemaining,
    isRunning,
    isPaused,
    totalDuration,
    startBlock,
    pauseBlock,
    resumeBlock,
    stopBlock,
    tick,
  } = useFlowBlockStore();

  // Fetch available flow blocks
  const { data: flowBlocks, isLoading } = useQuery({
    queryKey: ['flow-blocks'],
    queryFn: async () => {
      const response = await flowBlocksAPI.getFlowBlocks();
      return response.data.flowBlocks as FlowBlock[];
    },
  });

  // Timer effect
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, tick]);

  const start = (type: FlowBlockType, durationMinutes: number) => {
    startBlock(type, durationMinutes * 60); // Convert to seconds
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    if (totalDuration === 0) return 0;
    return ((totalDuration - timeRemaining) / totalDuration) * 100;
  };

  return {
    flowBlocks,
    isLoading,
    activeBlockType,
    timeRemaining,
    isRunning,
    isPaused,
    totalDuration,
    start,
    pause: pauseBlock,
    resume: resumeBlock,
    stop: stopBlock,
    formatTime,
    getProgress,
  };
}
