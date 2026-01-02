/**
 * JOB SERVICE
 * 
 * Frontend service for managing jobs.
 * Provides reactive job state management.
 */

import { FetchJob, JobStatus } from '../types/core';
import { apiClient, CreateJobRequest, ApproveJobRequest } from './api';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, limit, doc, onSnapshot as onSnapshotDoc } from 'firebase/firestore';

/**
 * Job service with real-time updates from Firestore
 */
export class JobService {
  /**
   * Create a new job
   */
  async createJob(request: CreateJobRequest): Promise<FetchJob> {
    const response = await apiClient.createJob(request);
    return response.job;
  }
  
  /**
   * Get a job by ID
   */
  async getJob(jobId: string): Promise<FetchJob> {
    const response = await apiClient.getJob(jobId);
    return response.job;
  }
  
  /**
   * Approve and publish a job
   */
  async approveJob(jobId: string, request: ApproveJobRequest): Promise<void> {
    await apiClient.approveJob(jobId, request);
  }
  
  /**
   * Get queue status
   */
  async getQueueStatus() {
    return apiClient.getQueueStatus();
  }
  
  /**
   * Subscribe to job updates (real-time from Firestore)
   */
  subscribeToJobs(
    callback: (jobs: FetchJob[]) => void,
    filters?: { status?: JobStatus; universityId?: string }
  ): () => void {
    let q = query(
      collection(db, 'fetch_jobs'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    if (filters?.universityId) {
      q = query(q, where('universityId', '==', filters.universityId));
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as FetchJob[];
      
      callback(jobs);
    }, (error) => {
      console.error('Error subscribing to jobs:', error);
    });
    
    return unsubscribe;
  }
  
  /**
   * Subscribe to a single job (real-time updates)
   */
  subscribeToJob(jobId: string, callback: (job: FetchJob | null) => void): () => void {
    // Use doc() to get a document reference
    const jobRef = doc(db, 'fetch_jobs', jobId);
    
    const unsubscribe = onSnapshotDoc(jobRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
      } else {
        const job = {
          id: snapshot.id,
          ...snapshot.data(),
        } as FetchJob;
        callback(job);
      }
    }, (error) => {
      console.error('Error subscribing to job:', error);
      callback(null);
    });
    
    return unsubscribe;
  }
}

// Export singleton instance
export const jobService = new JobService();

