'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TasksPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
        <p className="mt-2 text-gray-600">
          Manage your tasks and priorities.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Tasks</CardTitle>
          <CardDescription>No tasks yet. Create your first task to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Task management UI coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
