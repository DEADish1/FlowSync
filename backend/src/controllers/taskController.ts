import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { pool } from '../utils/db';
import { AppError } from '../middleware/errorHandler';
import { TaskPrioritizerService } from '../services/taskPrioritizerService';

const taskPrioritizer = new TaskPrioritizerService();

export class TaskController {
  async getTasks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const status = req.query.status as string;

      let query = 'SELECT * FROM tasks WHERE user_id = $1';
      const params: any[] = [userId];

      if (status) {
        query += ' AND status = $2';
        params.push(status);
      }

      query += ' ORDER BY created_at DESC';

      const result = await pool.query(query, params);
      res.json({ tasks: result.rows });
    } catch (error) {
      next(error);
    }
  }

  async getTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const taskId = parseInt(req.params.id);

      const result = await pool.query(
        'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
        [taskId, userId]
      );

      if (result.rows.length === 0) {
        throw new AppError(404, 'Task not found');
      }

      res.json({ task: result.rows[0] });
    } catch (error) {
      next(error);
    }
  }

  async createTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { title, description, difficulty, estimated_duration, deadline, energy_requirement, tags } = req.body;

      const result = await pool.query(
        `INSERT INTO tasks (user_id, title, description, difficulty, estimated_duration, deadline, energy_requirement, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [userId, title, description, difficulty, estimated_duration, deadline, energy_requirement, tags]
      );

      res.status(201).json({ task: result.rows[0] });
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const taskId = parseInt(req.params.id);
      const updates = req.body;

      const fields = Object.keys(updates);
      const values = Object.values(updates);

      if (fields.length === 0) {
        throw new AppError(400, 'No updates provided');
      }

      const setClause = fields.map((field, idx) => `${field} = $${idx + 3}`).join(', ');

      const result = await pool.query(
        `UPDATE tasks SET ${setClause}, updated_at = NOW()
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [taskId, userId, ...values]
      );

      if (result.rows.length === 0) {
        throw new AppError(404, 'Task not found');
      }

      res.json({ task: result.rows[0] });
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const taskId = parseInt(req.params.id);

      const result = await pool.query(
        'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
        [taskId, userId]
      );

      if (result.rows.length === 0) {
        throw new AppError(404, 'Task not found');
      }

      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async prioritizeTasks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { energyLevel } = req.body;

      // Get pending tasks
      const result = await pool.query(
        'SELECT * FROM tasks WHERE user_id = $1 AND status = $2',
        [userId, 'pending']
      );

      const tasks = result.rows;
      const prioritized = taskPrioritizer.prioritizeTasks(tasks, energyLevel, new Date());

      res.json({ tasks: prioritized });
    } catch (error) {
      next(error);
    }
  }
}
