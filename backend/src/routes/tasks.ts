import { Router } from 'express';
import { TaskController } from '../controllers/taskController';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';

const router = Router();
const taskController = new TaskController();

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  estimated_duration: z.number().optional(),
  deadline: z.string().datetime().optional(),
  energy_requirement: z.enum(['low', 'neutral', 'high']).optional(),
  tags: z.array(z.string()).optional(),
});

const updateTaskSchema = createTaskSchema.partial();

router.use(authenticateToken);

router.get('/', taskController.getTasks);
router.post('/', validateBody(createTaskSchema), taskController.createTask);
router.get('/:id', taskController.getTask);
router.put('/:id', validateBody(updateTaskSchema), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);
router.post('/prioritize', taskController.prioritizeTasks);

export default router;
