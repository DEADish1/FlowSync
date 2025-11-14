import { logger } from '../utils/logger';

export class SunoService {
  async generateSoundscape(params: {
    mood: string;
    energy: string;
    taskType: string;
  }): Promise<string> {
    const prompt = this.buildPrompt(params);
    logger.info(`Generated Suno prompt: ${prompt}`);
    return prompt;
  }

  private buildPrompt(params: { mood: string; energy: string; taskType: string }): string {
    const { mood, energy, taskType } = params;

    const energyTemplates = {
      low: 'ambient, slow tempo 60-80 bpm, calming, soft pads, gentle rhythm, peaceful',
      neutral: 'lo-fi beats, steady tempo 90-110 bpm, balanced, focus music, repetitive',
      high: 'upbeat, energetic, driving rhythm 130-150 bpm, motivational, dynamic',
    };

    const moodModifiers = {
      stressed: 'relaxing, tension-release, peaceful, soothing',
      calm: 'serene, flowing, harmonious, tranquil',
      excited: 'uplifting, positive, bright, joyful',
      tired: 'gentle, restorative, warm, nurturing',
      focused: 'minimal, repetitive, steady, concentrated',
      distracted: 'grounding, centering, structured, anchoring',
    };

    const taskTypeModifiers = {
      coding: 'electronic, minimal vocals, consistent beat',
      writing: 'soft piano, ambient strings, no lyrics',
      creative: 'inspiring, melodic, atmospheric',
      administrative: 'neutral, unobtrusive, background',
      learning: 'classical, baroque, cognitive enhancement',
    };

    const baseTemplate = energyTemplates[energy as keyof typeof energyTemplates] || energyTemplates.neutral;
    const moodMod = moodModifiers[mood as keyof typeof moodModifiers] || '';
    const taskMod = taskTypeModifiers[taskType as keyof typeof taskTypeModifiers] || '';

    return `${baseTemplate}, ${moodMod}, ${taskMod}, instrumental, high quality, perfect for productivity`;
  }
}
