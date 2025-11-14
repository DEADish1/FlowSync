import { Task, EnergyLevel, PrioritizedTask } from '../types';

export class TaskPrioritizerService {
  prioritizeTasks(
    tasks: Task[],
    energyLevel: EnergyLevel,
    currentTime: Date
  ): PrioritizedTask[] {
    return tasks
      .map((task) => {
        let priority = 0;

        // Energy-difficulty matching
        if (energyLevel === 'high' && task.difficulty === 'hard') priority += 10;
        if (energyLevel === 'low' && task.difficulty === 'easy') priority += 10;
        if (energyLevel === 'neutral' && task.difficulty === 'medium') priority += 8;

        // Mismatches
        if (energyLevel === 'low' && task.difficulty === 'hard') priority -= 5;
        if (energyLevel === 'high' && task.difficulty === 'easy') priority += 3; // Still ok

        // Deadline urgency
        const hoursUntilDeadline = task.deadline
          ? (task.deadline.getTime() - currentTime.getTime()) / (1000 * 60 * 60)
          : Infinity;

        if (hoursUntilDeadline < 24) priority += 15;
        else if (hoursUntilDeadline < 72) priority += 10;
        else if (hoursUntilDeadline < 168) priority += 5;

        // Energy requirement match
        if (task.energy_requirement === energyLevel) priority += 5;

        return {
          ...task,
          priority,
          suggestedTime: this.calculateSuggestedTime(task, energyLevel, currentTime, hoursUntilDeadline),
          reasoning: this.generateReasoning(task, energyLevel, hoursUntilDeadline),
        };
      })
      .sort((a, b) => b.priority - a.priority);
  }

  private calculateSuggestedTime(
    task: Task,
    energy: EnergyLevel,
    now: Date,
    hoursUntilDeadline: number
  ): string {
    if (hoursUntilDeadline < 24) return 'ASAP (deadline approaching)';

    if (energy === 'low') {
      if (task.difficulty === 'easy') return 'now';
      if (task.difficulty === 'medium') return 'after a short break';
      return 'later (after recharge)';
    }

    if (energy === 'high') {
      if (task.difficulty === 'hard') return 'now (optimal)';
      if (task.difficulty === 'medium') return 'now';
      return 'now or later';
    }

    // neutral energy
    return 'soon';
  }

  private generateReasoning(
    task: Task,
    energy: EnergyLevel,
    hoursUntilDeadline: number
  ): string {
    const reasons: string[] = [];

    if (hoursUntilDeadline < 24) {
      reasons.push('Urgent deadline within 24 hours');
    } else if (hoursUntilDeadline < 72) {
      reasons.push('Deadline approaching soon');
    }

    if (energy === 'low' && task.difficulty === 'hard') {
      reasons.push('Consider postponing - your energy is low for this difficult task');
    } else if (energy === 'high' && task.difficulty === 'hard') {
      reasons.push('Perfect time for this challenging task');
    } else if (energy === 'low' && task.difficulty === 'easy') {
      reasons.push('Good match - easy task for low energy');
    } else if (energy === 'high' && task.difficulty === 'easy') {
      reasons.push('You could tackle harder tasks, but this is fine too');
    }

    if (task.energy_requirement === energy) {
      reasons.push('Task energy requirement matches your current level');
    }

    return reasons.join('. ') || 'Standard priority task';
  }
}
