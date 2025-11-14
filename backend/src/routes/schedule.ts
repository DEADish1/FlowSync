import { Router } from 'express';
import { ScheduleController } from '../controllers/scheduleController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const scheduleController = new ScheduleController();

router.use(authenticateToken);

router.get('/', scheduleController.getSchedule);
router.post('/generate', scheduleController.generateSchedule);
router.put('/:id', scheduleController.updateSchedule);
router.post('/reshuffle', scheduleController.reshuffleSchedule);

export default router;
