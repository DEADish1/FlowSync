import { create } from 'zustand';
import { FlowBlockType } from '@/types';

interface FlowBlockState {
  activeBlockType: FlowBlockType | null;
  timeRemaining: number; // in seconds
  isRunning: boolean;
  isPaused: boolean;
  totalDuration: number; // in seconds
  startBlock: (type: FlowBlockType, duration: number) => void;
  pauseBlock: () => void;
  resumeBlock: () => void;
  stopBlock: () => void;
  tick: () => void;
}

export const useFlowBlockStore = create<FlowBlockState>((set, get) => ({
  activeBlockType: null,
  timeRemaining: 0,
  isRunning: false,
  isPaused: false,
  totalDuration: 0,

  startBlock: (type, duration) => {
    set({
      activeBlockType: type,
      timeRemaining: duration,
      totalDuration: duration,
      isRunning: true,
      isPaused: false,
    });
  },

  pauseBlock: () => {
    set({ isPaused: true, isRunning: false });
  },

  resumeBlock: () => {
    set({ isPaused: false, isRunning: true });
  },

  stopBlock: () => {
    set({
      activeBlockType: null,
      timeRemaining: 0,
      totalDuration: 0,
      isRunning: false,
      isPaused: false,
    });
  },

  tick: () => {
    const { timeRemaining, isRunning } = get();
    if (isRunning && timeRemaining > 0) {
      set({ timeRemaining: timeRemaining - 1 });
      if (timeRemaining - 1 === 0) {
        get().stopBlock();
      }
    }
  },
}));
