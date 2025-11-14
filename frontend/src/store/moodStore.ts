import { create } from 'zustand';
import { EnergyLevel, MoodCategory, MoodAnalysis } from '../types';

interface MoodState {
  currentEnergy: EnergyLevel | null;
  currentMood: MoodCategory | null;
  lastAnalysis: MoodAnalysis | null;
  setCurrentEnergy: (energy: EnergyLevel) => void;
  setCurrentMood: (mood: MoodCategory) => void;
  setLastAnalysis: (analysis: MoodAnalysis) => void;
}

export const useMoodStore = create<MoodState>((set) => ({
  currentEnergy: null,
  currentMood: null,
  lastAnalysis: null,

  setCurrentEnergy: (energy) => set({ currentEnergy: energy }),
  setCurrentMood: (mood) => set({ currentMood: mood }),
  setLastAnalysis: (analysis) =>
    set({
      lastAnalysis: analysis,
      currentEnergy: analysis.energyLevel,
      currentMood: analysis.moodCategory,
    }),
}));
