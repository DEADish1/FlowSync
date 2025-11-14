import { Router } from 'express';
import { MoodController } from '../controllers/moodController';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';

const router = Router();
const moodController = new MoodController();

const analyzeMoodSchema = z.object({
  text: z.string().min(1),
});

const logEnergySchema = z.object({
  energyLevel: z.enum(['low', 'neutral', 'high']),
  moodCategory: z.string().optional(),
  context: z.string().optional(),
});

router.use(authenticateToken);

router.post('/analyze', validateBody(analyzeMoodSchema), moodController.analyzeMood);
router.post('/log', validateBody(logEnergySchema), moodController.logEnergy);
router.get('/history', moodController.getHistory);
router.get('/patterns', moodController.getPatterns);

export default router;
