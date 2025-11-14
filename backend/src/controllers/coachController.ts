import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AIProductivityCoach } from '../services/aiCoachService';
import { EnergyAnalyticsService } from '../services/energyAnalyticsService';
import { pool } from '../utils/db';

const energyService = new EnergyAnalyticsService(pool);
const aiCoach = new AIProductivityCoach(energyService);

export class CoachController {
  async getInsights(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const insights = await aiCoach.generateInsights(userId);

      res.json({ insights });
    } catch (error) {
      next(error);
    }
  }

  async getDailyTip(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const tip = await aiCoach.getDailyRecommendation(userId);

      res.json({ tip });
    } catch (error) {
      next(error);
    }
  }

  async askQuestion(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { question } = req.body;

      // In a real implementation, this would use AI to answer contextual questions
      res.json({
        answer: `I received your question: "${question}". Custom Q&A not yet implemented.`,
      });
    } catch (error) {
      next(error);
    }
  }
}
