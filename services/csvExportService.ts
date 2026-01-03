/**
 * CSV Export Service
 * Exports job results to CSV format
 */

import { FetchJob } from '../types/core';

export interface JobCSVRow {
  'Job ID': string;
  'University Name': string;
  'Country': string;
  'Status': string;
  'Programs Found': number;
  'URLs Fetched': number;
  'Created At': string;
  'Completed At': string;
  'Error': string;
}

/**
 * Convert jobs to CSV format
 */
export function jobsToCSV(jobs: FetchJob[]): string {
  const rows: JobCSVRow[] = jobs.map(job => ({
    'Job ID': job.id,
    'University Name': job.universityName,
    'Country': job.country,
    'Status': job.status,
    'Programs Found': job.programsFound || 0,
    'URLs Fetched': job.urlsFetched?.length || 0,
    'Created At': job.createdAt ? new Date(job.createdAt).toLocaleString() : '',
    'Completed At': job.completedAt ? new Date(job.completedAt).toLocaleString() : '',
    'Error': job.error?.message || '',
  }));

  // Get headers from first row
  const headers = Object.keys(rows[0] || {}) as (keyof JobCSVRow)[];

  // Create CSV content
  const csvRows: string[] = [];

  // Add headers
  csvRows.push(headers.join(','));

  // Add data rows
  rows.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Escape commas and quotes in CSV
      if (typeof value === 'string') {
        const escaped = value.replace(/"/g, '""');
        return `"${escaped}"`;
      }
      return String(value);
    });
    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string = 'job-results.csv'): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Export jobs to CSV file
 */
export function exportJobsToCSV(jobs: FetchJob[]): void {
  if (jobs.length === 0) {
    alert('No jobs to export');
    return;
  }

  const csvContent = jobsToCSV(jobs);
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `job-results-${timestamp}.csv`;
  
  downloadCSV(csvContent, filename);
}

