// Core types for FlowSync backend

export type EnergyLevel = 'low' | 'neutral' | 'high';

export type MoodCategory = 'stressed' | 'calm' | 'excited' | 'tired' | 'focused' | 'distracted';

export type TaskDifficulty = 'easy' | 'medium' | 'hard';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type FlowBlockType =
  | 'power-focus'
  | 'creative-block'
  | 'chill-reset'
  | 'grind-mode'
  | 'recovery'
  | 'deep-work';

export interface User {
  id: number;
  email: string;
  name?: string;
  timezone: string;
  preferences: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  difficulty: TaskDifficulty;
  estimated_duration?: number; // minutes
  deadline?: Date;
  status: TaskStatus;
  energy_requirement?: EnergyLevel;
  tags?: string[];
  created_at: Date;
  updated_at: Date;
}

export interface Schedule {
  id: number;
  user_id: number;
  task_id: number;
  scheduled_start: Date;
  scheduled_end: Date;
  flow_block_type?: string;
  status: string;
  completed_at?: Date;
  created_at: Date;
}

export interface EnergyLog {
  id: number;
  user_id: number;
  timestamp: Date;
  energy_level: EnergyLevel;
  mood_category?: MoodCategory;
  mood_text?: string;
  context?: string;
  productivity_score?: number;
  created_at: Date;
}

export interface MoodAnalysis {
  energyLevel: EnergyLevel;
  moodCategory: MoodCategory;
  confidence: number;
  suggestions: string[];
}

export interface PrioritizedTask extends Task {
  priority: number;
  suggestedTime: string;
  reasoning: string;
}

export interface FlowBlock {
  id: string;
  type: FlowBlockType;
  name: string;
  description: string;
  duration: number; // minutes
  settings: {
    breakReminders: boolean;
    musicType: string;
    allowInterruptions: boolean;
    intensityLevel: number; // 1-10
  };
}

export interface MusicRecommendation {
  playlist_id?: string;
  playlist_name?: string;
  tracks?: any[];
  suno_prompt?: string;
}

export interface AuthPayload {
  userId: number;
  email: string;
}

export interface JWTPayload extends AuthPayload {
  iat: number;
  exp: number;
}
