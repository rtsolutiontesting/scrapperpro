/**
 * JOB QUEUE
 * 
 * Manages the queue of fetch jobs.
 * Ensures only one university is processed at a time (sequential execution).
 */

import { FetchJob, JobStatus } from '../types/core.js';
import { Config } from '../config.js';
import { Logger } from '../utils/logger.js';
import { waitBetweenUniversities } from '../utils/delay.js';
import { JobManager } from './job-manager.js';

export interface QueuedJob {
  job: FetchJob;
  urls: string[];
  options: { autoPublish: boolean; createdBy: string };
}

/**
 * JobQueue class
 * Manages job queue and execution
 */
export class JobQueue {
  private config: Config;
  private logger: Logger;
  private jobManager: JobManager;
  private queue: QueuedJob[] = [];
  private isProcessing: boolean = false;
  private currentJob: FetchJob | null = null;
  
  constructor(config: Config, logger: Logger, jobManager: JobManager) {
    this.config = config;
    this.logger = logger;
    this.jobManager = jobManager;
  }
  
  /**
   * Add a job to the queue
   */
  async enqueue(job: FetchJob, urls: string[], options: { autoPublish: boolean; createdBy: string }): Promise<void> {
    this.queue.push({ job, urls, options });
    this.logger.info(`Job enqueued`, {
      jobId: job.id,
      queueSize: this.queue.length,
    });
    
    // Start processing if not already processing
    if (!this.isProcessing) {
      this.processQueue().catch(error => {
        this.logger.error(`Queue processing error`, error);
      });
    }
  }
  
  /**
   * Process the queue sequentially
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return;
    }
    
    this.isProcessing = true;
    
    try {
      while (this.queue.length > 0) {
        const queuedJob = this.queue.shift();
        if (!queuedJob) break;
        
        this.currentJob = queuedJob.job;
        
        try {
          this.logger.info(`Processing job from queue`, {
            jobId: queuedJob.job.id,
            queueSize: this.queue.length,
          });
          
          await this.jobManager.executeJob(queuedJob.job, queuedJob.urls, queuedJob.options);
          
        } catch (error: any) {
          this.logger.error(`Job processing failed`, error, {
            jobId: queuedJob.job.id,
          });
          // Continue with next job even if this one failed
        }
        
        // Wait before processing next university (if queue not empty)
        if (this.queue.length > 0) {
          await waitBetweenUniversities(this.config);
        }
        
        this.currentJob = null;
      }
    } finally {
      this.isProcessing = false;
      this.currentJob = null;
    }
  }
  
  /**
   * Get current queue status
   */
  getStatus(): { queueSize: number; isProcessing: boolean; currentJobId: string | null } {
    return {
      queueSize: this.queue.length,
      isProcessing: this.isProcessing,
      currentJobId: this.currentJob?.id || null,
    };
  }
  
  /**
   * Clear the queue
   */
  clear(): void {
    this.queue = [];
    this.logger.info(`Queue cleared`);
  }
}

