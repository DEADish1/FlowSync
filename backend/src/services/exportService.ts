import { Pool } from 'pg';
import { format } from 'date-fns';

export type ExportFormat = 'csv' | 'json';

/**
 * ExportService - Handles data export in various formats
 */
export class ExportService {
  constructor(private db: Pool) {}

  /**
   * Export tasks to CSV or JSON
   */
  async exportTasks(
    userId: number,
    format: ExportFormat,
    startDate?: Date,
    endDate?: Date
  ): Promise<string> {
    let query = `SELECT * FROM tasks WHERE user_id = $1`;
    const params: any[] = [userId];

    if (startDate) {
      params.push(startDate);
      query += ` AND created_at >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      query += ` AND created_at <= $${params.length}`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await this.db.query(query, params);
    const tasks = result.rows;

    if (format === 'csv') {
      return this.tasksToCSV(tasks);
    } else {
      return JSON.stringify({
        exported_at: new Date().toISOString(),
        user_id: userId,
        count: tasks.length,
        tasks,
      }, null, 2);
    }
  }

  /**
   * Export energy logs to CSV or JSON
   */
  async exportEnergyLogs(
    userId: number,
    format: ExportFormat,
    startDate?: Date,
    endDate?: Date
  ): Promise<string> {
    let query = `SELECT * FROM energy_logs WHERE user_id = $1`;
    const params: any[] = [userId];

    if (startDate) {
      params.push(startDate);
      query += ` AND timestamp >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      query += ` AND timestamp <= $${params.length}`;
    }

    query += ` ORDER BY timestamp DESC`;

    const result = await this.db.query(query, params);
    const logs = result.rows;

    if (format === 'csv') {
      return this.energyLogsToCSV(logs);
    } else {
      return JSON.stringify({
        exported_at: new Date().toISOString(),
        user_id: userId,
        count: logs.length,
        logs,
      }, null, 2);
    }
  }

  /**
   * Export full user data archive (JSON)
   */
  async exportFullArchive(userId: number): Promise<string> {
    const [tasks, energyLogs, schedules, insights] = await Promise.all([
      this.db.query('SELECT * FROM tasks WHERE user_id = $1', [userId]),
      this.db.query('SELECT * FROM energy_logs WHERE user_id = $1', [userId]),
      this.db.query('SELECT * FROM schedules WHERE user_id = $1', [userId]),
      this.db.query('SELECT * FROM insights WHERE user_id = $1', [userId]),
    ]);

    return JSON.stringify({
      exported_at: new Date().toISOString(),
      user_id: userId,
      data: {
        tasks: tasks.rows,
        energy_logs: energyLogs.rows,
        schedules: schedules.rows,
        insights: insights.rows,
      },
      summary: {
        total_tasks: tasks.rows.length,
        total_energy_logs: energyLogs.rows.length,
        total_schedules: schedules.rows.length,
        total_insights: insights.rows.length,
      },
    }, null, 2);
  }

  /**
   * Convert tasks to CSV format
   */
  private tasksToCSV(tasks: any[]): string {
    if (tasks.length === 0) {
      return 'No data to export';
    }

    const headers = [
      'ID',
      'Title',
      'Description',
      'Status',
      'Difficulty',
      'Estimated Duration (min)',
      'Deadline',
      'Energy Requirement',
      'Created At',
      'Updated At',
    ];

    const rows = tasks.map(task => [
      task.id,
      this.escapeCSV(task.title),
      this.escapeCSV(task.description || ''),
      task.status,
      task.difficulty || '',
      task.estimated_duration || '',
      task.deadline ? format(new Date(task.deadline), 'yyyy-MM-dd HH:mm:ss') : '',
      task.energy_requirement || '',
      format(new Date(task.created_at), 'yyyy-MM-dd HH:mm:ss'),
      format(new Date(task.updated_at), 'yyyy-MM-dd HH:mm:ss'),
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Convert energy logs to CSV format
   */
  private energyLogsToCSV(logs: any[]): string {
    if (logs.length === 0) {
      return 'No data to export';
    }

    const headers = [
      'ID',
      'Timestamp',
      'Energy Level',
      'Mood Category',
      'Mood Text',
      'Context',
      'Productivity Score',
    ];

    const rows = logs.map(log => [
      log.id,
      format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      log.energy_level,
      log.mood_category || '',
      this.escapeCSV(log.mood_text || ''),
      this.escapeCSV(log.context || ''),
      log.productivity_score || '',
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Escape CSV values
   */
  private escapeCSV(value: string): string {
    if (!value) return '';
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
