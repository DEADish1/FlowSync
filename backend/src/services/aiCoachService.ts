import OpenAI from 'openai';
import { config } from '../utils/config';
import { logger } from '../utils/logger';
import { EnergyAnalyticsService } from './energyAnalyticsService';

export class AIProductivityCoach {
  private openai: OpenAI | null = null;

  constructor(private energyService: EnergyAnalyticsService) {
    if (config.ai.openaiApiKey) {
      this.openai = new OpenAI({ apiKey: config.ai.openaiApiKey });
    }
  }

  async generateInsights(userId: number): Promise<string[]> {
    if (!this.openai) {
      logger.warn('OpenAI API key not configured, using fallback insights');
      return this.fallbackInsights();
    }

    try {
      // Gather user data
      const energyMap = await this.energyService.getEnergyMap(userId, 14);
      const bestTimes = await this.energyService.predictBestTimes(userId);

      const prompt = `Based on this user's energy patterns over the past 2 weeks:

Energy Map Data: ${JSON.stringify(energyMap, null, 2)}
Best Performance Times: ${JSON.stringify(bestTimes, null, 2)}

Provide 3-5 actionable, personalized productivity insights. Focus on:
1. When they naturally have peak energy
2. Patterns in their low-energy periods
3. Specific suggestions for task scheduling
4. Habits they could develop

Format as a JSON object with an "insights" array of strings.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content!);
      return result.insights || this.fallbackInsights();
    } catch (error) {
      logger.error('Error generating insights:', error);
      return this.fallbackInsights();
    }
  }

  async getDailyRecommendation(userId: number): Promise<string> {
    if (!this.openai) {
      logger.warn('OpenAI API key not configured, using fallback recommendation');
      return this.fallbackRecommendation();
    }

    try {
      const now = new Date();
      const hour = now.getHours();
      const dayOfWeek = now.getDay();

      const patterns = await this.energyService.predictBestTimes(userId);

      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      const prompt = `It's ${hour}:00 on a ${dayNames[dayOfWeek]}.

Based on this user's historical patterns: ${JSON.stringify(patterns, null, 2)}

Generate a brief, motivational recommendation for RIGHT NOW. One sentence only.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
      });

      return response.choices[0].message.content! || this.fallbackRecommendation();
    } catch (error) {
      logger.error('Error generating daily recommendation:', error);
      return this.fallbackRecommendation();
    }
  }

  private fallbackInsights(): string[] {
    return [
      'Track your energy levels consistently to get personalized insights',
      'Try scheduling difficult tasks during your peak energy hours',
      'Take regular breaks to maintain sustained productivity',
      'Experiment with different flow blocks to find what works best',
      'Review your energy patterns weekly to identify trends',
    ];
  }

  private fallbackRecommendation(): string {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Morning energy is great for tackling challenging tasks. Let's make the most of it!";
    } else if (hour < 17) {
      return 'Afternoon focus time - perfect for steady progress on your tasks.';
    } else {
      return 'Evening hours are ideal for lighter tasks and planning tomorrow.';
    }
  }
}
