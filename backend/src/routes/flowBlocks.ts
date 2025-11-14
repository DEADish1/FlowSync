import { Router } from 'express';
import { FlowBlockController } from '../controllers/flowBlockController';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';

const router = Router();
const flowBlockController = new FlowBlockController();

const createFlowBlockSchema = z.object({
  type: z.string(),
  name: z.string(),
  description: z.string().optional(),
  duration: z.number(),
  settings: z.object({
    breakReminders: z.boolean(),
    musicType: z.string(),
    allowInterruptions: z.boolean(),
    intensityLevel: z.number().min(1).max(10),
  }),
});

router.use(authenticateToken);

router.get('/', flowBlockController.getFlowBlocks);
router.post('/custom', validateBody(createFlowBlockSchema), flowBlockController.createCustomBlock);
router.get('/active', flowBlockController.getActiveBlock);

export default router;
