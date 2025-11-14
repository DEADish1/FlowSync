import axios from 'axios';
import { config } from '../utils/config';
import { logger } from '../utils/logger';
import { cacheGet, cacheSet } from '../utils/redis';

export class SpotifyService {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  async authenticate(): Promise<void> {
    if (!config.music.spotifyClientId || !config.music.spotifyClientSecret) {
      logger.warn('Spotify credentials not configured');
      return;
    }

    try {
      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${config.music.spotifyClientId}:${config.music.spotifyClientSecret}`
            ).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + response.data.expires_in * 1000;

      logger.info('Spotify authentication successful');
    } catch (error) {
      logger.error('Spotify authentication failed:', error);
      throw error;
    }
  }

  async getPlaylistForMood(mood: string, energy: string): Promise<any[]> {
    // Check cache first
    const cacheKey = `spotify:${mood}:${energy}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    if (!this.accessToken || Date.now() >= this.tokenExpiry) {
      await this.authenticate();
    }

    if (!this.accessToken) {
      return [];
    }

    try {
      const searchQuery = `${mood} ${energy} focus`;
      const response = await axios.get(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=playlist&limit=5`,
        {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        }
      );

      const playlists = response.data.playlists.items;

      // Cache for 1 hour
      await cacheSet(cacheKey, playlists, 3600);

      return playlists;
    } catch (error) {
      logger.error('Error fetching Spotify playlists:', error);
      return [];
    }
  }

  async getRecommendations(
    seedGenres: string[],
    energy: number,
    valence: number
  ): Promise<any[]> {
    if (!this.accessToken || Date.now() >= this.tokenExpiry) {
      await this.authenticate();
    }

    if (!this.accessToken) {
      return [];
    }

    try {
      const response = await axios.get(
        'https://api.spotify.com/v1/recommendations',
        {
          params: {
            seed_genres: seedGenres.join(','),
            target_energy: energy,
            target_valence: valence,
            limit: 20,
          },
          headers: { Authorization: `Bearer ${this.accessToken}` },
        }
      );

      return response.data.tracks;
    } catch (error) {
      logger.error('Error fetching Spotify recommendations:', error);
      return [];
    }
  }
}
