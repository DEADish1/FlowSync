import { FlowBlock, FlowBlockType } from '../types';

export const defaultFlowBlocks: Record<FlowBlockType, FlowBlock> = {
  'power-focus': {
    id: 'power-focus',
    type: 'power-focus',
    duration: 25,
    name: 'Power Focus',
    description: 'Short, intense focus session (Pomodoro style)',
    settings: {
      breakReminders: true,
      musicType: 'upbeat-focus',
      allowInterruptions: false,
      intensityLevel: 8,
    },
  },
  'creative-block': {
    id: 'creative-block',
    type: 'creative-block',
    duration: 45,
    name: 'Creative Block',
    description: 'Free-flowing creative work with ambient sounds',
    settings: {
      breakReminders: false,
      musicType: 'ambient-creative',
      allowInterruptions: true,
      intensityLevel: 5,
    },
  },
  'chill-reset': {
    id: 'chill-reset',
    type: 'chill-reset',
    duration: 10,
    name: 'Chill Reset',
    description: 'Short mental break to recharge',
    settings: {
      breakReminders: true,
      musicType: 'chill-lofi',
      allowInterruptions: true,
      intensityLevel: 2,
    },
  },
  'grind-mode': {
    id: 'grind-mode',
    type: 'grind-mode',
    duration: 90,
    name: 'Grind Mode',
    description: 'Extended work session for repetitive tasks',
    settings: {
      breakReminders: true,
      musicType: 'rhythmic-focus',
      allowInterruptions: false,
      intensityLevel: 7,
    },
  },
  'recovery': {
    id: 'recovery',
    type: 'recovery',
    duration: 15,
    name: 'Recovery',
    description: 'Restore energy after intense work',
    settings: {
      breakReminders: false,
      musicType: 'calm-ambient',
      allowInterruptions: true,
      intensityLevel: 1,
    },
  },
  'deep-work': {
    id: 'deep-work',
    type: 'deep-work',
    duration: 120,
    name: 'Deep Work',
    description: 'Uninterrupted focus for complex tasks',
    settings: {
      breakReminders: true,
      musicType: 'minimal-ambient',
      allowInterruptions: false,
      intensityLevel: 9,
    },
  },
};
