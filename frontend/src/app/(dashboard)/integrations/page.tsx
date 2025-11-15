'use client';

import { useState } from 'react';
import { Download, Zap, FileText, Calendar, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

export default function IntegrationsPage() {
  const { toast } = useToast();
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [exportType, setExportType] = useState<'tasks' | 'energy' | 'full'>('tasks');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      let response;
      const endpoint = exportType === 'full' ? '/export/full' : `/export/${exportType}`;

      response = await api.post(endpoint, {
        format: exportType === 'full' ? 'json' : exportFormat,
      }, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      const extension = exportType === 'full' ? 'json' : exportFormat;
      link.setAttribute('download', `flowsync-${exportType}-${new Date().toISOString().split('T')[0]}.${extension}`);

      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: 'Export Successful',
        description: `Your ${exportType} data has been downloaded.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting your data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient">Integrations</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Connect FlowSync with external tools and export your data
        </p>
      </div>

      {/* Notifications Settings */}
      <Card className="shadow-soft border-purple-aura/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Manage how you receive notifications from FlowSync
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Browser Notifications</p>
              <p className="text-sm text-muted-foreground">
                Get notified about tasks, flow blocks, and achievements
              </p>
            </div>
            <Badge variant="secondary" className="gradient-primary text-white">
              Active
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <div className="mt-0.5">📋</div>
              <div>
                <p className="font-medium">Task Reminders</p>
                <p className="text-muted-foreground">15 min before tasks</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-0.5">▶️</div>
              <div>
                <p className="font-medium">Flow Block Alerts</p>
                <p className="text-muted-foreground">Start and end notifications</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-0.5">⚡</div>
              <div>
                <p className="font-medium">Energy Checks</p>
                <p className="text-muted-foreground">Every 2 hours</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-0.5">🎉</div>
              <div>
                <p className="font-medium">Achievements</p>
                <p className="text-muted-foreground">Instant notifications</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card className="shadow-soft border-purple-aura/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Download className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Data Export</CardTitle>
              <CardDescription>
                Download your FlowSync data in various formats
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Export Type</label>
              <Select value={exportType} onValueChange={(value: any) => setExportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tasks">Tasks</SelectItem>
                  <SelectItem value="energy">Energy Logs</SelectItem>
                  <SelectItem value="full">Full Archive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {exportType !== 'full' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Format</label>
                <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">Export Information</p>
              <p className="text-blue-700 dark:text-blue-300 mt-1">
                {exportType === 'tasks' && 'Export all your tasks with their details, status, and timestamps.'}
                {exportType === 'energy' && 'Export your energy logs including mood, energy levels, and productivity scores.'}
                {exportType === 'full' && 'Download a complete archive of all your FlowSync data in JSON format.'}
              </p>
            </div>
          </div>

          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full gradient-primary-hover"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : `Export ${exportType === 'full' ? 'Archive' : exportType.charAt(0).toUpperCase() + exportType.slice(1)}`}
          </Button>
        </CardContent>
      </Card>

      {/* Coming Soon */}
      <Card className="shadow-soft border-purple-aura/20 opacity-60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-300 dark:bg-gray-700 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>Google Calendar Sync</CardTitle>
                <Badge variant="outline" className="text-xs">Coming Soon</Badge>
              </div>
              <CardDescription>
                Two-way synchronization with Google Calendar
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Automatically sync your FlowSync schedule with Google Calendar and import calendar events as tasks.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-soft border-purple-aura/20 opacity-60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-300 dark:bg-gray-700 rounded-lg">
              <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>Webhooks & Automation</CardTitle>
                <Badge variant="outline" className="text-xs">Coming Soon</Badge>
              </div>
              <CardDescription>
                Automate workflows with custom webhooks
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Connect FlowSync with Zapier, Slack, and other tools to automate your productivity workflow.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
