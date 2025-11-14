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

router.use(authenticateToken);

router.get('/insights', coachController.getInsights);
router.get('/daily-tip', coachController.getDailyTip);
router.post('/ask', validateBody(askQuestionSchema), coachController.askQuestion);

export default router;
