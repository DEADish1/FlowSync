'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function MoodPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mood Check-in</h1>
        <p className="mt-2 text-gray-600">
          Tell us how you're feeling and we'll optimize your schedule.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How are you feeling?</CardTitle>
          <CardDescription>Describe your current mood and energy level</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Mood input component coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
