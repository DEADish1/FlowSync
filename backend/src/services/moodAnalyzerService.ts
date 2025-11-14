import OpenAI from 'openai';
import { config } from '../utils/config';
import { MoodAnalysis, EnergyLevel, MoodCategory } from '../types';
import { logger } from '../utils/logger';

export class MoodAnalyzerService {
  private openai: OpenAI | null = null;

  constructor() {
    if (config.ai.openaiApiKey) {
      this.openai = new OpenAI({ apiKey: config.ai.openaiApiKey });
    }
  }

  async analyzeMood(moodText: string): Promise<MoodAnalysis> {
    if (!this.openai) {
      logger.warn('OpenAI API key not configured, using fallback mood analysis');
      return this.fallbackAnalysis(moodText);
    }

    try {
      const prompt = `Analyze this mood/energy statement and provide:
1. Energy level (low/neutral/high)
2. Mood category (stressed/calm/excited/tired/focused/distracted)
3. Confidence score (0-100)
4. 2-3 suggestions for optimal task scheduling

User statement: "${moodText}"

Respond in JSON format:
{
  "energyLevel": "low|neutral|high",
  "moodCategory": "stressed|calm|excited|tired|focused|distracted",
  "confidence": 85,
  "suggestions": ["suggestion 1", "suggestion 2"]
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content!);
      return result as MoodAnalysis;
    } catch (error) {
      logger.error('Error analyzing mood with OpenAI:', error);
      return this.fallbackAnalysis(moodText);
    }
  }

  private fallbackAnalysis(moodText: string): MoodAnalysis {
    const lowerText = moodText.toLowerCase();

    // Simple keyword-based analysis
    let energyLevel: EnergyLevel = 'neutral';
    let moodCategory: MoodCategory = 'calm';

    if (lowerText.includes('tired') || lowerText.includes('exhausted') || lowerText.includes('drained')) {
      energyLevel = 'low';
      moodCategory = 'tired';
    } else if (lowerText.includes('energetic') || lowerText.includes('pumped') || lowerText.includes('excited')) {
      energyLevel = 'high';
      moodCategory = 'excited';
    } else if (lowerText.includes('stressed') || lowerText.includes('anxious') || lowerText.includes('overwhelmed')) {
      energyLevel = 'low';
      moodCategory = 'stressed';
    } else if (lowerText.includes('focused') || lowerText.includes('concentrated')) {
      energyLevel = 'high';
      moodCategory = 'focused';
    } else if (lowerText.includes('distracted') || lowerText.includes('scattered')) {
      energyLevel = 'neutral';
      moodCategory = 'distracted';
    }

    return {
      energyLevel,
      moodCategory,
      confidence: 60,
      suggestions: this.getSuggestions(energyLevel, moodCategory),
    };
  }

  private getSuggestions(energy: EnergyLevel, mood: MoodCategory): string[] {
    if (energy === 'low') {
      return [
        'Start with easier tasks to build momentum',
        'Take short breaks between tasks',
        'Consider a 10-minute recovery block',
      ];
    } else if (energy === 'high') {
      return [
        'Tackle your most challenging tasks now',
        'Use a deep work or power focus block',
        'This is optimal time for complex problem-solving',
      ];
    } else {
      return [
        'Mix easier and moderate difficulty tasks',
        'Use creative blocks for variety',
        'Stay flexible with your schedule',
      ];
    }
  }
}
