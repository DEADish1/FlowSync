'use client';

import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { CheckSquare, Clock, Edit, Trash2, AlertCircle } from 'lucide-react';
import { Task, TaskDifficulty, TaskStatus } from '@/types';
import { formatDate } from '@/lib/utils';

const difficultyColors: Record<TaskDifficulty, 'default' | 'warning' | 'danger'> = {
  easy: 'success',
  medium: 'warning',
  hard: 'danger',
};

const statusColors: Record<TaskStatus, 'default' | 'info' | 'success' | 'danger'> = {
  pending: 'default',
  in_progress: 'info',
  completed: 'success',
  cancelled: 'danger',
};

interface TaskListProps {
  onEdit: (task: Task) => void;
}

export function TaskList({ onEdit }: TaskListProps) {
  const { tasks, isLoading, deleteTask, updateTask, isDeleting } = useTasks();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    setDeletingId(id);
    try {
      await deleteTask(id);
    } catch (error) {
      console.error('Failed to delete task:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    const newStatus: TaskStatus =
      task.status === 'completed' ? 'pending' : 'completed';
    await updateTask(task.id, { status: newStatus });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <Loading text="Loading tasks..." />
        </CardContent>
      </Card>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No tasks yet. Create your first task to get started!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <Card key={task.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {/* Checkbox */}
              <button
                onClick={() => handleToggleComplete(task)}
                className="mt-1"
              >
                <div
                  className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                    task.status === 'completed'
                      ? 'bg-green-600 border-green-600'
                      : 'border-gray-300 hover:border-green-600'
                  }`}
                >
                  {task.status === 'completed' && (
                    <CheckSquare className="h-4 w-4 text-white" />
                  )}
                </div>
              </button>

              {/* Task Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3
                      className={`font-medium text-gray-900 ${
                        task.status === 'completed' ? 'line-through text-gray-500' : ''
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(task)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(task.id)}
                      disabled={deletingId === task.id}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {task.difficulty && (
                    <Badge variant={difficultyColors[task.difficulty]}>
                      {task.difficulty}
                    </Badge>
                  )}
                  <Badge variant={statusColors[task.status]}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                  {task.energy_requirement && (
                    <Badge variant="default">
                      Energy: {task.energy_requirement}
                    </Badge>
                  )}
                  {task.estimated_duration && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {task.estimated_duration} min
                    </span>
                  )}
                  {task.deadline && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Due: {formatDate(task.deadline)}
                    </span>
                  )}
                </div>

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {task.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
