// Frontend types matching backend

export type EnergyLevel = 'low' | 'neutral' | 'high';
export type MoodCategory = 'stressed' | 'calm' | 'excited' | 'tired' | 'focused' | 'distracted';
export type TaskDifficulty = 'easy' | 'medium' | 'hard';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type FlowBlockType = 'power-focus' | 'creative-block' | 'chill-reset' | 'grind-mode' | 'recovery' | 'deep-work';

export interface User {
  id: number;
  email: string;
  name?: string;
  timezone: string;
  preferences: Record<string, any>;
}

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  difficulty: TaskDifficulty;
  estimated_duration?: number;
  deadline?: string;
  status: TaskStatus;
  energy_requirement?: EnergyLevel;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface PrioritizedTask extends Task {
  priority: number;
  suggestedTime: string;
  reasoning: string;
}

export interface MoodAnalysis {
  energyLevel: EnergyLevel;
  moodCategory: MoodCategory;
  confidence: number;
  suggestions: string[];
}

export interface EnergyLog {
  id: number;
  timestamp: string;
  energy_level: EnergyLevel;
  mood_category?: MoodCategory;
  context?: string;
  productivity_score?: number;
}

export interface FlowBlock {
  id: string;
  type: FlowBlockType;
  name: string;
  description: string;
  duration: number;
  settings: {
    breakReminders: boolean;
    musicType: string;
    allowInterruptions: boolean;
    intensityLevel: number;
  };
}

export interface Schedule {
  id: number;
  user_id: number;
  task_id: number;
  scheduled_start: string;
  scheduled_end: string;
  flow_block_type?: string;
  status: string;
  task_title?: string;
  difficulty?: TaskDifficulty;
}

export interface MusicRecommendation {
  playlist_id?: string;
  playlist_name?: string;
  tracks?: any[];
  suno_prompt?: string;
}
