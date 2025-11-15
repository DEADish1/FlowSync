import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { exportController } from '../controllers/exportController';

const router = Router();

// All export routes require authentication
router.use(authenticate);

// Export tasks
router.post('/tasks', exportController.exportTasks);

// Export energy logs
router.post('/energy', exportController.exportEnergy);

// Export full archive
router.post('/full', exportController.exportFull);

export default router;
