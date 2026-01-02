/**
 * Bulk Operations Service
 * Handles bulk creation of jobs from Excel data
 */

import { API_URL } from './api';

export interface BulkUniversityData {
  universityName: string;
  country: string;
  campus?: string;
  urls: string[];
}

export interface BulkCreateResponse {
  success: boolean;
  created: number;
  failed: number;
  jobs: Array<{
    id: string;
    universityName: string;
    status: string;
  }>;
  errors?: Array<{
    universityName: string;
    error: string;
  }>;
}

/**
 * Create multiple jobs from bulk university data
 */
export async function bulkCreateJobs(
  universities: BulkUniversityData[],
  createdBy: string = 'system'
): Promise<BulkCreateResponse> {
  const jobs = [];
  const errors = [];
  let created = 0;
  let failed = 0;

  // Process each university (sequential to avoid rate limits)
  for (const university of universities) {
    try {
      const response = await fetch(`${API_URL}/jobs/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          universityName: university.universityName,
          country: university.country,
          urls: university.urls,
          autoPublish: false,
          createdBy: createdBy,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      jobs.push({
        id: data.job?.id || 'unknown',
        universityName: university.universityName,
        status: data.job?.status || 'QUEUED',
      });
      created++;

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error: any) {
      errors.push({
        universityName: university.universityName,
        error: error.message || 'Unknown error',
      });
      failed++;
    }
  }

  return {
    success: failed === 0,
    created,
    failed,
    jobs,
    errors: errors.length > 0 ? errors : undefined,
  };
}


