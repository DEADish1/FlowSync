import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const analyticsController = new AnalyticsController();

router.use(authenticateToken);

router.get('/energy-map', analyticsController.getEnergyMap);
router.get('/best-times', analyticsController.getBestTimes);
router.get('/productivity-score', analyticsController.getProductivityScore);

export default router;
