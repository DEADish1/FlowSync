import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { api } from '@/utils/api';

interface ScheduledTask {
  id: number;
  task_id: number;
  task_title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  scheduled_start: string;
  scheduled_end: string;
  flow_block_type?: string;
  status: string;
}

interface GenerateScheduleResponse {
  message: string;
  schedule: ScheduledTask[];
  count: number;
}

export function useSchedule() {
  const { token } = useAuth();
  const [schedule, setSchedule] = useState<ScheduledTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch schedule for a date range
  const fetchSchedule = async (startDate?: string, endDate?: string) => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start', startDate);
      if (endDate) params.append('end', endDate);

      const response = await api.get(`/api/schedule?${params.toString()}`, token);
      const data = await response.json();

      setSchedule(data.schedule || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch schedule');
      console.error('Error fetching schedule:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate optimized schedule
  const generateSchedule = async (date?: string): Promise<boolean> => {
    if (!token) {
      setError('Not authenticated');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post(
        '/api/schedule/generate',
        { date },
        token
      );

      if (!response.ok) {
        throw new Error('Failed to generate schedule');
      }

      const data: GenerateScheduleResponse = await response.json();
      setSchedule(data.schedule);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to generate schedule');
      console.error('Error generating schedule:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Reshuffle schedule based on current energy
  const reshuffleSchedule = async (energyLevel: 'low' | 'neutral' | 'high', date?: string): Promise<boolean> => {
    if (!token) {
      setError('Not authenticated');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post(
        '/api/schedule/reshuffle',
        { energyLevel, date },
        token
      );

      if (!response.ok) {
        throw new Error('Failed to reshuffle schedule');
      }

      const data: GenerateScheduleResponse = await response.json();
      setSchedule(data.schedule);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to reshuffle schedule');
      console.error('Error reshuffling schedule:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update a scheduled task
  const updateScheduledTask = async (
    scheduleId: number,
    updates: Partial<ScheduledTask>
  ): Promise<boolean> => {
    if (!token) {
      setError('Not authenticated');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.put(
        `/api/schedule/${scheduleId}`,
        updates,
        token
      );

      if (!response.ok) {
        throw new Error('Failed to update schedule');
      }

      const data = await response.json();

      // Update local state
      setSchedule(prev =>
        prev.map(item => (item.id === scheduleId ? data.schedule : item))
      );

      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to update schedule');
      console.error('Error updating schedule:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch schedule on mount
  useEffect(() => {
    if (token) {
      fetchSchedule();
    }
  }, [token]);

  return {
    schedule,
    isLoading,
    error,
    fetchSchedule,
    generateSchedule,
    reshuffleSchedule,
    updateScheduledTask,
  };
}
