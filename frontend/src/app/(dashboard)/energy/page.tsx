'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function EnergyPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Energy Map</h1>
        <p className="mt-2 text-gray-600">
          Visualize your energy patterns throughout the week.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Energy Patterns</CardTitle>
          <CardDescription>Track when you perform best</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Energy map visualization coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
