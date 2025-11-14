import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { pool } from '../utils/db';
import { defaultFlowBlocks } from '../models/flowBlock';

export class FlowBlockController {
  async getFlowBlocks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      // Get user's custom flow blocks
      const result = await pool.query(
        'SELECT * FROM flow_blocks WHERE user_id = $1',
        [userId]
      );

      const customBlocks = result.rows;

      // Combine with default blocks
      const allBlocks = [...Object.values(defaultFlowBlocks), ...customBlocks];

      res.json({ flowBlocks: allBlocks });
    } catch (error) {
      next(error);
    }
  }

  async createCustomBlock(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { type, name, description, duration, settings } = req.body;

      const result = await pool.query(
        `INSERT INTO flow_blocks (user_id, type, name, description, duration, settings, is_custom)
         VALUES ($1, $2, $3, $4, $5, $6, true)
         RETURNING *`,
        [userId, type, name, description, duration, JSON.stringify(settings)]
      );

      res.status(201).json({ flowBlock: result.rows[0] });
    } catch (error) {
      next(error);
    }
  }

  async getActiveBlock(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      // Get the currently active schedule item
      const result = await pool.query(
        `SELECT s.*, fb.name as block_name, fb.duration, fb.settings
         FROM schedules s
         LEFT JOIN flow_blocks fb ON s.flow_block_type = fb.type
         WHERE s.user_id = $1
           AND s.scheduled_start <= NOW()
           AND s.scheduled_end >= NOW()
           AND s.status = 'scheduled'
         LIMIT 1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return res.json({ activeBlock: null });
      }

      res.json({ activeBlock: result.rows[0] });
    } catch (error) {
      next(error);
    }
  }
}
