import { Router } from 'express';
import { MusicController } from '../controllers/musicController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const musicController = new MusicController();

router.use(authenticateToken);

router.get('/recommendations', musicController.getRecommendations);
router.post('/suno-prompt', musicController.generateSunoPrompt);
router.get('/spotify-playlist/:id', musicController.getSpotifyPlaylist);

export default router;
