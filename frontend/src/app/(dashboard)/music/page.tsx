'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function MusicPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Music</h1>
        <p className="mt-2 text-gray-600">
          Personalized music recommendations for your workflow.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Music Recommendations</CardTitle>
          <CardDescription>Playlists matched to your mood and energy</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Music recommendations coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
