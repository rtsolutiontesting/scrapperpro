/**
 * FRONTEND API SERVICE
 * 
 * Handles all communication with the backend API.
 * Frontend never scrapes directly - all requests go through this service.
 */

import { FetchJob, JobStatus } from '../types/core';

export const API_URL = import.meta.env.VITE_API_URL || 'https://university-data-api.rtsolutiontesting.workers.dev';

const API_BASE_URL = API_URL;

export interface CreateJobRequest {
  universityName: string;
  country: string;
  urls: string[];
  autoPublish?: boolean;
  createdBy?: string;
}

export interface ApproveJobRequest {
  approvedBy: string;
  programIds?: string[];
}

export interface QueueStatus {
  queueSize: number;
  isProcessing: boolean;
  currentJobId: string | null;
}

/**
 * API client class
 */
class APIClient {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error: any) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }
  
  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }
  
  /**
   * Create a new fetch job
   */
  async createJob(request: CreateJobRequest): Promise<{ job: FetchJob }> {
    return this.request('/jobs/create', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
  
  /**
   * Get job status
   */
  async getJob(jobId: string): Promise<{ job: FetchJob }> {
    return this.request(`/jobs/${jobId}`);
  }
  
  /**
   * Approve and publish a job
   */
  async approveJob(jobId: string, request: ApproveJobRequest): Promise<{ success: boolean }> {
    return this.request(`/jobs/${jobId}/approve`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
  
  /**
   * Get queue status
   */
  async getQueueStatus(): Promise<QueueStatus> {
    return this.request('/queue/status');
  }
}

// Export singleton instance
export const apiClient = new APIClient(API_BASE_URL);

