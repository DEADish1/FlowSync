'use client';

import { useState, useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Task, TaskDifficulty, EnergyLevel } from '@/types';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
}

const difficultyOptions = [
  { value: '', label: 'Select difficulty' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const energyOptions = [
  { value: '', label: 'Select energy requirement' },
  { value: 'low', label: 'Low' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'high', label: 'High' },
];

export function TaskForm({ isOpen, onClose, task }: TaskFormProps) {
  const { createTask, updateTask, isCreating, isUpdating } = useTasks();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: '' as TaskDifficulty | '',
    estimated_duration: '',
    deadline: '',
    energy_requirement: '' as EnergyLevel | '',
    tags: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        difficulty: task.difficulty || '',
        estimated_duration: task.estimated_duration?.toString() || '',
        deadline: task.deadline ? task.deadline.split('T')[0] : '',
        energy_requirement: task.energy_requirement || '',
        tags: task.tags?.join(', ') || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        difficulty: '',
        estimated_duration: '',
        deadline: '',
        energy_requirement: '',
        tags: '',
      });
    }
  }, [task]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const taskData = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      difficulty: formData.difficulty || undefined,
      estimated_duration: formData.estimated_duration
        ? parseInt(formData.estimated_duration)
        : undefined,
      deadline: formData.deadline || undefined,
      energy_requirement: formData.energy_requirement || undefined,
      tags: formData.tags
        ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : undefined,
    };

    try {
      if (task) {
        await updateTask(task.id, taskData);
      } else {
        await createTask(taskData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Create New Task'}
      description={task ? 'Update task details' : 'Add a new task to your list'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          error={errors.title}
          placeholder="What needs to be done?"
          required
        />

        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Add more details... (optional)"
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Difficulty"
            options={difficultyOptions}
            value={formData.difficulty}
            onChange={(e) =>
              setFormData({ ...formData, difficulty: e.target.value as TaskDifficulty })
            }
          />

          <Select
            label="Energy Requirement"
            options={energyOptions}
            value={formData.energy_requirement}
            onChange={(e) =>
              setFormData({ ...formData, energy_requirement: e.target.value as EnergyLevel })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Estimated Duration (minutes)"
            type="number"
            value={formData.estimated_duration}
            onChange={(e) =>
              setFormData({ ...formData, estimated_duration: e.target.value })
            }
            placeholder="30"
            min="1"
          />

          <Input
            label="Deadline"
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          />
        </div>

        <Input
          label="Tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="work, urgent, meeting (comma separated)"
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isCreating || isUpdating}
            disabled={isCreating || isUpdating}
          >
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
