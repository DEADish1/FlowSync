'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksAPI } from '@/lib/api';
import { useTaskStore } from '@/store/taskStore';
import { Task } from '@/types';

export function useTasks() {
  const queryClient = useQueryClient();
  const { setTasks, addTask, updateTask, deleteTask, filter, sortBy } = useTaskStore();

  // Fetch tasks
  const {
    data: tasks,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['tasks', filter.status],
    queryFn: async () => {
      const response = await tasksAPI.getTasks(filter.status);
      const fetchedTasks = response.data.tasks as Task[];
      setTasks(fetchedTasks);
      return fetchedTasks;
    },
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: Partial<Task>) => {
      const response = await tasksAPI.createTask(taskData);
      return response.data.task as Task;
    },
    onSuccess: (newTask) => {
      addTask(newTask);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Task> }) => {
      const response = await tasksAPI.updateTask(id, updates);
      return response.data.task as Task;
    },
    onSuccess: (updatedTask) => {
      updateTask(updatedTask.id, updatedTask);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await tasksAPI.deleteTask(id);
      return id;
    },
    onSuccess: (id) => {
      deleteTask(id);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Prioritize tasks mutation
  const prioritizeTasksMutation = useMutation({
    mutationFn: async (energyLevel: string) => {
      const response = await tasksAPI.prioritize(energyLevel);
      return response.data.tasks;
    },
  });

  return {
    tasks: tasks || [],
    isLoading,
    error,
    refetch,
    createTask: createTaskMutation.mutateAsync,
    updateTask: (id: number, updates: Partial<Task>) =>
      updateTaskMutation.mutateAsync({ id, updates }),
    deleteTask: deleteTaskMutation.mutateAsync,
    prioritizeTasks: prioritizeTasksMutation.mutateAsync,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
    isPrioritizing: prioritizeTasksMutation.isPending,
    prioritizedTasks: prioritizeTasksMutation.data,
  };
}
