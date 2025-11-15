import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { pool } from '../utils/db';
import { ScheduleGeneratorService } from '../services/scheduleGeneratorService';

const scheduleGenerator = new ScheduleGeneratorService();

export class ScheduleController {
  async getSchedule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const startDate = req.query.start as string || new Date().toISOString();
      const endDate = req.query.end as string;

      let query = `
        SELECT s.*, t.title as task_title, t.difficulty
        FROM schedules s
        LEFT JOIN tasks t ON s.task_id = t.id
        WHERE s.user_id = $1 AND s.scheduled_start >= $2
      `;
      const params: any[] = [userId, startDate];

      if (endDate) {
        query += ' AND s.scheduled_end <= $3';
        params.push(endDate);
      }

      query += ' ORDER BY s.scheduled_start ASC';

      const result = await pool.query(query, params);
      res.json({ schedule: result.rows });
    } catch (error) {
      next(error);
    }
  }

  async generateSchedule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const date = req.body.date ? new Date(req.body.date) : new Date();

      const schedule = await scheduleGenerator.generateOptimizedSchedule(userId, date);

      res.json({
        message: 'Schedule generated successfully',
        schedule,
        count: schedule.length,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSchedule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const scheduleId = parseInt(req.params.id);
      const updates = req.body;

      const fields = Object.keys(updates);
      const values = Object.values(updates);

      const setClause = fields.map((field, idx) => `${field} = $${idx + 3}`).join(', ');

      const result = await pool.query(
        `UPDATE schedules SET ${setClause}
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [scheduleId, userId, ...values]
      );

      res.json({ schedule: result.rows[0] });
    } catch (error) {
      next(error);
    }
  }

  async reshuffleSchedule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { energyLevel, date } = req.body;
      const scheduleDate = date ? new Date(date) : new Date();

      const newSchedule = await scheduleGenerator.reshuffleSchedule(
        userId,
        energyLevel,
        scheduleDate
      );

      res.json({
        message: 'Schedule reshuffled successfully based on your current energy',
        schedule: newSchedule,
        count: newSchedule.length,
      });
    } catch (error) {
      next(error);
    }
  }
}
