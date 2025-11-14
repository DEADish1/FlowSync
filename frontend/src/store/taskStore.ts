import { create } from 'zustand';
import { Task, TaskStatus, TaskDifficulty } from '@/types';

interface TaskFilter {
  status?: TaskStatus;
  difficulty?: TaskDifficulty;
  search?: string;
}

interface TaskState {
  tasks: Task[];
  filter: TaskFilter;
  sortBy: 'created' | 'deadline' | 'difficulty';
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: number, updates: Partial<Task>) => void;
  deleteTask: (id: number) => void;
  setFilter: (filter: TaskFilter) => void;
  setSortBy: (sortBy: 'created' | 'deadline' | 'difficulty') => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  filter: {},
  sortBy: 'created',

  setTasks: (tasks) => set({ tasks }),

  addTask: (task) =>
    set((state) => ({
      tasks: [task, ...state.tasks],
    })),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    })),

  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),

  setFilter: (filter) => set({ filter }),

  setSortBy: (sortBy) => set({ sortBy }),
}));
