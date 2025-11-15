import { Router } from 'express';
import { CoachController } from '../controllers/coachController';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';

const router = Router();
const coachController = new CoachController();

const askQuestionSchema = z.object({
  question: z.string().min(1),
});

const breakdownTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

router.use(authenticateToken);

router.get('/insights', coachController.getInsights);
router.get('/daily-tip', coachController.getDailyTip);
router.get('/briefing', coachController.getDailyBriefing);
router.post('/ask', validateBody(askQuestionSchema), coachController.askQuestion);
router.post('/breakdown', validateBody(breakdownTaskSchema), coachController.breakdownTask);

export default router;
