import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { SpotifyService } from '../services/spotifyService';
import { SunoService } from '../services/sunoService';

const spotifyService = new SpotifyService();
const sunoService = new SunoService();

export class MusicController {
  async getRecommendations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const mood = req.query.mood as string || 'neutral';
      const energy = req.query.energy as string || 'neutral';

      const playlists = await spotifyService.getPlaylistForMood(mood, energy);

      res.json({ playlists });
    } catch (error) {
      next(error);
    }
  }

  async generateSunoPrompt(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { mood, energy, taskType } = req.body;

      const prompt = await sunoService.generateSoundscape({ mood, energy, taskType });

      res.json({ prompt });
    } catch (error) {
      next(error);
    }
  }

  async getSpotifyPlaylist(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const playlistId = req.params.id;

      // In a real implementation, fetch playlist details from Spotify
      res.json({ message: 'Playlist fetch not yet implemented', playlistId });
    } catch (error) {
      next(error);
    }
  }
}
