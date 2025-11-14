'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CoachPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Productivity Coach</h1>
        <p className="mt-2 text-gray-600">
          Get personalized insights and recommendations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Insights</CardTitle>
          <CardDescription>AI-powered coaching based on your patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">AI coach insights coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
