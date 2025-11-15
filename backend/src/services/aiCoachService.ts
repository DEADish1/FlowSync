import OpenAI from 'openai';
import { config } from '../utils/config';
import { logger } from '../utils/logger';
import { pool } from '../utils/db';
import { EnergyAnalyticsService } from './energyAnalyticsService';
import { EnergyLevel, TaskDifficulty } from '../types';

interface DailyBriefing {
  greeting: string;
  energyForecast: string;
  topPriorities: string[];
  recommendations: string[];
  motivationalQuote: string;
}

interface TaskBreakdown {
  subtasks: Array<{
    title: string;
    estimatedDuration: number;
    difficulty: TaskDifficulty;
    order: number;
  }>;
  strategy: string;
  estimatedTotalTime: number;
}

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

  /**
   * Generate personalized daily briefing
   */
  async generateDailyBriefing(userId: number): Promise<DailyBriefing> {
    if (!this.openai) {
      return this.fallbackDailyBriefing();
    }

    try {
      const stats = await this.getUserStats(userId);
      const hour = new Date().getHours();

      const prompt = `You are FlowSync, an AI productivity coach with a calm, confident voice.

Generate a personalized daily briefing for a user with these stats:
- Pending Tasks: ${stats.pendingTasks}
- Completion Rate: ${stats.completionRate}%
- Current Streak: ${stats.currentStreak} days
- Dominant Energy: ${stats.dominantEnergy}

Current time: ${hour}:00

Create a briefing with:
1. Warm greeting (1 sentence)
2. Energy forecast based on their dominant energy pattern (2 sentences)
3. Top 3 actionable priorities for today
4. 2-3 specific recommendations
5. Motivational quote (1 sentence)

Keep it brief, supportive, and energizing.

Respond in JSON:
{
  "greeting": "string",
  "energyForecast": "string",
  "topPriorities": ["string", "string", "string"],
  "recommendations": ["string", "string"],
  "motivationalQuote": "string"
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      return JSON.parse(response.choices[0].message.content!) as DailyBriefing;
    } catch (error) {
      logger.error('Error generating daily briefing:', error);
      return this.fallbackDailyBriefing();
    }
  }

  /**
   * Break down a complex task into subtasks
   */
  async breakdownTask(
    userId: number,
    taskTitle: string,
    taskDescription?: string
  ): Promise<TaskBreakdown> {
    if (!this.openai) {
      return this.fallbackTaskBreakdown(taskTitle);
    }

    try {
      const prompt = `Break down this task into 3-7 actionable subtasks:

Task: ${taskTitle}
${taskDescription ? `Description: ${taskDescription}` : ''}

Each subtask should:
- Be specific and measurable
- Take 15-60 minutes
- Have a logical order

Provide:
- subtasks: [{title, estimatedDuration (minutes), difficulty ("easy"|"medium"|"hard"), order}]
- strategy: Brief approach (1-2 sentences)
- estimatedTotalTime: Total minutes

Respond in JSON format.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      return JSON.parse(response.choices[0].message.content!) as TaskBreakdown;
    } catch (error) {
      logger.error('Error breaking down task:', error);
      return this.fallbackTaskBreakdown(taskTitle);
    }
  }

  /**
   * Get user statistics for coaching
   */
  private async getUserStats(userId: number) {
    const statsQuery = await pool.query(
      `SELECT
         COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
         COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
         COUNT(*) as total
       FROM tasks
       WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '30 days'`,
      [userId]
    );

    const stats = statsQuery.rows[0];
    const completionRate = stats.total > 0
      ? Math.round((parseInt(stats.completed) / parseInt(stats.total)) * 100)
      : 0;

    const streakQuery = await pool.query(
      `SELECT COUNT(DISTINCT DATE(timestamp)) as streak
       FROM energy_logs
       WHERE user_id = $1 AND timestamp >= NOW() - INTERVAL '7 days'`,
      [userId]
    );

    const energyQuery = await pool.query(
      `SELECT energy_level, COUNT(*) as count
       FROM energy_logs
       WHERE user_id = $1 AND timestamp >= NOW() - INTERVAL '7 days'
       GROUP BY energy_level
       ORDER BY count DESC
       LIMIT 1`,
      [userId]
    );

    return {
      pendingTasks: parseInt(stats.pending || 0),
      completionRate,
      currentStreak: parseInt(streakQuery.rows[0]?.streak || 0),
      dominantEnergy: energyQuery.rows[0]?.energy_level || 'neutral',
    };
  }

  private fallbackDailyBriefing(): DailyBriefing {
    const hour = new Date().getHours();
    return {
      greeting: hour < 12
        ? 'Good morning! Ready to sync with your rhythm?'
        : hour < 18
        ? 'Good afternoon! Time to find your flow.'
        : 'Good evening! Let\'s wrap up mindfully.',
      energyForecast: 'Track your energy consistently to get personalized forecasts based on your patterns.',
      topPriorities: [
        'Log your current energy level',
        'Review and prioritize your tasks',
        'Start with your most important task',
      ],
      recommendations: [
        'Match task difficulty to your energy level',
        'Take breaks to maintain focus',
      ],
      motivationalQuote: 'Your rhythm. Your day. In sync.',
    };
  }

  private fallbackTaskBreakdown(taskTitle: string): TaskBreakdown {
    return {
      subtasks: [
        {
          title: `Plan approach for: ${taskTitle}`,
          estimatedDuration: 20,
          difficulty: 'easy',
          order: 1,
        },
        {
          title: `Execute main work: ${taskTitle}`,
          estimatedDuration: 45,
          difficulty: 'medium',
          order: 2,
        },
        {
          title: `Review and refine: ${taskTitle}`,
          estimatedDuration: 20,
          difficulty: 'easy',
          order: 3,
        },
      ],
      strategy: 'Start with planning, execute the main work, then review your results.',
      estimatedTotalTime: 85,
    };
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
