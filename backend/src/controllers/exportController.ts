import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ExportService } from '../services/exportService';
import { pool } from '../utils/db';

const exportService = new ExportService(pool);

export class ExportController {
  /**
   * POST /api/export/tasks
   * Export tasks
   */
  async exportTasks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { format = 'csv', startDate, endDate } = req.body;

      const data = await exportService.exportTasks(
        userId,
        format,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );

      const filename = `flowsync-tasks-${new Date().toISOString().split('T')[0]}.${format}`;

      res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/export/energy
   * Export energy logs
   */
  async exportEnergy(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { format = 'csv', startDate, endDate } = req.body;

      const data = await exportService.exportEnergyLogs(
        userId,
        format,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );

      const filename = `flowsync-energy-${new Date().toISOString().split('T')[0]}.${format}`;

      res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/export/full
   * Export full data archive
   */
  async exportFull(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const data = await exportService.exportFullArchive(userId);

      const filename = `flowsync-archive-${new Date().toISOString().split('T')[0]}.json`;

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(data);
    } catch (error) {
      next(error);
    }
  }
}

export const exportController = new ExportController();
