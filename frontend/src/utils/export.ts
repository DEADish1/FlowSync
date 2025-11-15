/**
 * Export utilities for user data
 */

interface ExportData {
  user?: any;
  tasks?: any[];
  moods?: any[];
  energyPatterns?: any[];
  flowBlocks?: any[];
  insights?: any[];
}

/**
 * Export data as JSON file
 */
export function exportAsJSON(data: ExportData, filename: string = 'flowsync-data') {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Convert array of objects to CSV string
 */
function arrayToCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Escape quotes and wrap in quotes if contains comma
      const escaped = String(value).replace(/"/g, '""');
      return escaped.includes(',') || escaped.includes('\n') ? `"${escaped}"` : escaped;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

/**
 * Export data as CSV files (one per data type)
 */
export function exportAsCSV(data: ExportData, filename: string = 'flowsync-data') {
  const dateStr = new Date().toISOString().split('T')[0];

  // Export tasks
  if (data.tasks && data.tasks.length > 0) {
    const csv = arrayToCSV(data.tasks);
    downloadCSV(csv, `${filename}-tasks-${dateStr}.csv`);
  }

  // Export moods
  if (data.moods && data.moods.length > 0) {
    const csv = arrayToCSV(data.moods);
    downloadCSV(csv, `${filename}-moods-${dateStr}.csv`);
  }

  // Export energy patterns
  if (data.energyPatterns && data.energyPatterns.length > 0) {
    const csv = arrayToCSV(data.energyPatterns);
    downloadCSV(csv, `${filename}-energy-${dateStr}.csv`);
  }

  // Export flow blocks
  if (data.flowBlocks && data.flowBlocks.length > 0) {
    const csv = arrayToCSV(data.flowBlocks);
    downloadCSV(csv, `${filename}-flowblocks-${dateStr}.csv`);
  }

  // Export insights
  if (data.insights && data.insights.length > 0) {
    const csv = arrayToCSV(data.insights);
    downloadCSV(csv, `${filename}-insights-${dateStr}.csv`);
  }
}

/**
 * Helper to download CSV string as file
 */
function downloadCSV(csvString: string, filename: string) {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
