'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDataExport } from '@/hooks/useDataExport';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { User, Bell, Palette, Database, Download } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { exportData, isExporting } = useDataExport();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your account and preferences.
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="Name" value={user?.name || ''} disabled />
          <Input label="Email" value={user?.email || ''} disabled />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timezone
            </label>
            <Badge>{user?.timezone || 'UTC'}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Manage your notification preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Notification settings coming soon...</p>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>Customize the look and feel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Theme
            </label>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data & Privacy
          </CardTitle>
          <CardDescription>Manage your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Export Your Data
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Download all your FlowSync data in JSON or CSV format
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => exportData('json')}
                disabled={isExporting}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export as JSON'}
              </Button>
              <Button
                variant="outline"
                onClick={() => exportData('csv')}
                disabled={isExporting}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export as CSV'}
              </Button>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Danger Zone
            </label>
            <Button variant="danger">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
