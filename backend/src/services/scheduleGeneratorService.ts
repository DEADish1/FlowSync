import { pool } from '../utils/db';
import { Task, EnergyLevel, TaskDifficulty, PrioritizedTask, Schedule } from '../types';
import { logger } from '../utils/logger';

interface EnergyPattern {
  hour: number;
  avgEnergy: number;
  count: number;
}

interface TimeSlot {
  start: Date;
  end: Date;
  energyLevel: EnergyLevel;
  available: boolean;
}

export class ScheduleGeneratorService {
  /**
   * Generate an optimized schedule for a user based on their energy patterns
   */
  async generateOptimizedSchedule(
    userId: number,
    date: Date = new Date()
  ): Promise<Schedule[]> {
    try {
      // 1. Get user's energy patterns
      const energyPatterns = await this.getEnergyPatterns(userId);

      // 2. Get pending tasks
      const pendingTasks = await this.getPendingTasks(userId);

      if (pendingTasks.length === 0) {
        logger.info('No pending tasks to schedule');
        return [];
      }

      // 3. Prioritize tasks based on deadline, difficulty, and energy requirements
      const prioritizedTasks = this.prioritizeTasks(pendingTasks);

      // 4. Generate time slots for the day
      const timeSlots = this.generateTimeSlots(date, energyPatterns);

      // 5. Match tasks to optimal time slots
      const schedule = this.matchTasksToSlots(prioritizedTasks, timeSlots);

      // 6. Save schedule to database
      const savedSchedule = await this.saveSchedule(userId, schedule);

      logger.info(`Generated schedule with ${savedSchedule.length} tasks for user ${userId}`);
      return savedSchedule;
    } catch (error) {
      logger.error('Error generating schedule:', error);
      throw error;
    }
  }

  /**
   * Get user's historical energy patterns by time of day
   */
  private async getEnergyPatterns(userId: number): Promise<EnergyPattern[]> {
    const query = `
      SELECT
        EXTRACT(HOUR FROM timestamp AT TIME ZONE 'UTC') as hour,
        CASE
          WHEN energy_level = 'high' THEN 3
          WHEN energy_level = 'neutral' THEN 2
          ELSE 1
        END as energy_value
      FROM energy_logs
      WHERE user_id = $1
        AND timestamp >= NOW() - INTERVAL '30 days'
      ORDER BY timestamp DESC
    `;

    const result = await pool.query(query, [userId]);

    // Aggregate by hour
    const hourlyData: Record<number, { sum: number; count: number }> = {};

    result.rows.forEach(row => {
      const hour = parseInt(row.hour);
      const energyValue = parseInt(row.energy_value);

      if (!hourlyData[hour]) {
        hourlyData[hour] = { sum: 0, count: 0 };
      }

      hourlyData[hour].sum += energyValue;
      hourlyData[hour].count += 1;
    });

    // Convert to array with averages
    const patterns: EnergyPattern[] = [];
    for (let hour = 0; hour < 24; hour++) {
      const data = hourlyData[hour];
      if (data && data.count > 0) {
        patterns.push({
          hour,
          avgEnergy: data.sum / data.count,
          count: data.count,
        });
      } else {
        // Default patterns based on common energy levels
        const defaultEnergy = this.getDefaultEnergyForHour(hour);
        patterns.push({
          hour,
          avgEnergy: defaultEnergy,
          count: 0,
        });
      }
    }

    return patterns;
  }

  /**
   * Get default energy levels for hours with no data
   * Based on typical circadian rhythms
   */
  private getDefaultEnergyForHour(hour: number): number {
    // High energy: 9-12, 14-16
    if ((hour >= 9 && hour < 12) || (hour >= 14 && hour < 16)) {
      return 2.5; // Between neutral and high
    }
    // Low energy: 13-14 (lunch dip), 22-7 (night/early morning)
    if (hour === 13 || hour >= 22 || hour < 7) {
      return 1.5; // Between low and neutral
    }
    // Neutral
    return 2;
  }

  /**
   * Get pending tasks for the user
   */
  private async getPendingTasks(userId: number): Promise<Task[]> {
    const query = `
      SELECT *
      FROM tasks
      WHERE user_id = $1
        AND status = 'pending'
        AND (deadline IS NULL OR deadline >= NOW())
      ORDER BY deadline ASC NULLS LAST, created_at ASC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  /**
   * Prioritize tasks based on multiple factors
   */
  private prioritizeTasks(tasks: Task[]): PrioritizedTask[] {
    return tasks.map(task => {
      let priority = 0;

      // Factor 1: Deadline urgency (0-40 points)
      if (task.deadline) {
        const daysUntilDeadline = Math.ceil(
          (task.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilDeadline <= 1) priority += 40;
        else if (daysUntilDeadline <= 3) priority += 30;
        else if (daysUntilDeadline <= 7) priority += 20;
        else priority += 10;
      } else {
        priority += 5; // Low priority for tasks without deadline
      }

      // Factor 2: Difficulty (0-30 points - harder tasks get higher priority)
      if (task.difficulty === 'hard') priority += 30;
      else if (task.difficulty === 'medium') priority += 20;
      else priority += 10;

      // Factor 3: Energy requirement match (0-30 points)
      if (task.energy_requirement === 'high') priority += 25;
      else if (task.energy_requirement === 'neutral') priority += 15;
      else priority += 10;

      return {
        ...task,
        priority,
        suggestedTime: '',
        reasoning: '',
      };
    }).sort((a, b) => b.priority - a.priority);
  }

  /**
   * Generate time slots for the working day
   */
  private generateTimeSlots(date: Date, patterns: EnergyPattern[]): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const startHour = 8; // 8 AM
    const endHour = 18; // 6 PM
    const slotDuration = 60; // 60 minutes

    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    for (let hour = startHour; hour < endHour; hour++) {
      const pattern = patterns.find(p => p.hour === hour);
      const avgEnergy = pattern?.avgEnergy || 2;

      // Convert average energy to energy level
      let energyLevel: EnergyLevel;
      if (avgEnergy >= 2.5) energyLevel = 'high';
      else if (avgEnergy >= 1.8) energyLevel = 'neutral';
      else energyLevel = 'low';

      const start = new Date(year, month, day, hour, 0);
      const end = new Date(year, month, day, hour, slotDuration);

      slots.push({
        start,
        end,
        energyLevel,
        available: true,
      });
    }

    return slots;
  }

  /**
   * Match tasks to optimal time slots based on energy levels
   */
  private matchTasksToSlots(
    tasks: PrioritizedTask[],
    slots: TimeSlot[]
  ): Array<{ task: Task; slot: TimeSlot; flowBlockType?: string }> {
    const schedule: Array<{ task: Task; slot: TimeSlot; flowBlockType?: string }> = [];

    for (const task of tasks) {
      // Find the best slot for this task
      const bestSlot = this.findBestSlot(task, slots);

      if (bestSlot) {
        schedule.push({
          task,
          slot: bestSlot,
          flowBlockType: this.recommendFlowBlockType(task, bestSlot.energyLevel),
        });

        // Mark slot as unavailable
        bestSlot.available = false;

        // If task duration > 60 min, mark subsequent slots as unavailable
        const taskDuration = task.estimated_duration || 60;
        const slotsNeeded = Math.ceil(taskDuration / 60);
        if (slotsNeeded > 1) {
          const slotIndex = slots.indexOf(bestSlot);
          for (let i = 1; i < slotsNeeded && slotIndex + i < slots.length; i++) {
            slots[slotIndex + i].available = false;
          }
        }
      }
    }

    return schedule;
  }

  /**
   * Find the best time slot for a task based on energy requirements
   */
  private findBestSlot(task: Task, slots: TimeSlot[]): TimeSlot | null {
    const taskEnergy = task.energy_requirement || this.inferEnergyRequirement(task.difficulty);

    // Filter available slots
    const availableSlots = slots.filter(slot => slot.available);

    if (availableSlots.length === 0) return null;

    // Find slots that match the energy requirement
    let matchingSlots = availableSlots.filter(slot => slot.energyLevel === taskEnergy);

    // If no exact match, find close matches
    if (matchingSlots.length === 0) {
      if (taskEnergy === 'high') {
        matchingSlots = availableSlots.filter(slot => slot.energyLevel === 'neutral');
      } else if (taskEnergy === 'neutral') {
        matchingSlots = availableSlots;
      } else {
        matchingSlots = availableSlots.filter(
          slot => slot.energyLevel === 'neutral' || slot.energyLevel === 'low'
        );
      }
    }

    // Return the first matching slot (earliest in the day)
    return matchingSlots.length > 0 ? matchingSlots[0] : availableSlots[0];
  }

  /**
   * Infer energy requirement from task difficulty
   */
  private inferEnergyRequirement(difficulty: TaskDifficulty): EnergyLevel {
    switch (difficulty) {
      case 'hard':
        return 'high';
      case 'medium':
        return 'neutral';
      case 'easy':
        return 'low';
      default:
        return 'neutral';
    }
  }

  /**
   * Recommend a flow block type based on task and energy level
   */
  private recommendFlowBlockType(task: Task, energyLevel: EnergyLevel): string {
    if (energyLevel === 'high') {
      return task.difficulty === 'hard' ? 'deep-work' : 'power-focus';
    } else if (energyLevel === 'neutral') {
      return task.difficulty === 'easy' ? 'creative-block' : 'power-focus';
    } else {
      return task.difficulty === 'easy' ? 'chill-reset' : 'recovery';
    }
  }

  /**
   * Save the generated schedule to the database
   */
  private async saveSchedule(
    userId: number,
    schedule: Array<{ task: Task; slot: TimeSlot; flowBlockType?: string }>
  ): Promise<Schedule[]> {
    const savedSchedules: Schedule[] = [];

    for (const item of schedule) {
      const query = `
        INSERT INTO schedules (user_id, task_id, scheduled_start, scheduled_end, flow_block_type, status)
        VALUES ($1, $2, $3, $4, $5, 'scheduled')
        RETURNING *
      `;

      const result = await pool.query(query, [
        userId,
        item.task.id,
        item.slot.start,
        item.slot.end,
        item.flowBlockType || null,
      ]);

      savedSchedules.push(result.rows[0]);
    }

    return savedSchedules;
  }

  /**
   * Reshuffle schedule based on current energy level
   */
  async reshuffleSchedule(
    userId: number,
    currentEnergy: EnergyLevel,
    date: Date = new Date()
  ): Promise<Schedule[]> {
    try {
      // Delete existing schedule for today
      await pool.query(
        `DELETE FROM schedules
         WHERE user_id = $1
           AND scheduled_start::date = $2::date
           AND status = 'scheduled'`,
        [userId, date]
      );

      // Generate new schedule with current energy consideration
      return await this.generateOptimizedSchedule(userId, date);
    } catch (error) {
      logger.error('Error reshuffling schedule:', error);
      throw error;
    }
  }
}
