'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FlowPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Flow Blocks</h1>
        <p className="mt-2 text-gray-600">
          Choose your work mode and stay in the zone.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Flow Blocks</CardTitle>
          <CardDescription>Select a flow block to start a focused session</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Flow block selector coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
