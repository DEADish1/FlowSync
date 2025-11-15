'use client';

import { useState } from 'react';
import { useAuth } from './useAuth';
import { useTasks } from './useTasks';
import { useMood } from './useMood';
import { exportAsJSON, exportAsCSV } from '@/utils/export';
import { useToast } from '@/components/ui/toast';

export function useDataExport() {
  const [isExporting, setIsExporting] = useState(false);
  const { user } = useAuth();
  const { tasks } = useTasks();
  const { history: moods } = useMood();
  const { toast } = useToast();

  const exportData = async (format: 'json' | 'csv') => {
    setIsExporting(true);

    try {
      // Gather all user data
      const exportData = {
        user: {
          name: user?.name,
          email: user?.email,
          timezone: user?.timezone,
        },
        tasks: tasks || [],
        moods: moods || [],
        energyPatterns: [], // Will be populated when backend is connected
        flowBlocks: [], // Will be populated when backend is connected
        insights: [], // Will be populated when backend is connected
        exportedAt: new Date().toISOString(),
      };

      // Export based on format
      if (format === 'json') {
        exportAsJSON(exportData, 'flowsync-data');
        toast({
          title: 'Export Successful',
          description: 'Your data has been exported as JSON',
          variant: 'success',
        });
      } else {
        exportAsCSV(exportData, 'flowsync-data');
        toast({
          title: 'Export Successful',
          description: 'Your data has been exported as CSV files',
          variant: 'success',
        });
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting your data',
        variant: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportData,
    isExporting,
  };
}
