'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SchedulePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
        <p className="mt-2 text-gray-600">
          View and manage your daily schedule.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Schedule</CardTitle>
          <CardDescription>AI-optimized schedule based on your energy levels</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Schedule view coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
