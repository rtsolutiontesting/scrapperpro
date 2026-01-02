/**
 * JOB LIFECYCLE MANAGER
 * 
 * Orchestrates the entire data ingestion pipeline.
 * Manages job state machine and coordinates all layers.
 * 
 * Job Lifecycle States:
 * QUEUED → FETCHING → PARSING → VALIDATING → DIFFING → AI_VERIFYING → READY_TO_PUBLISH → PUBLISHED
 *                                                                                        ↓
 *                                                                                    FAILED
 *                                                                                        ↓
 *                                                                                  FAILED_BLOCKED
 */

import { JobStatus, FetchJob, Program, ProgramDiff, DiffResult } from '../types/core.js';
import { Config } from '../config.js';
import { Logger } from '../utils/logger.js';
import { Fetcher } from '../layers/fetcher.js';
import { Parser } from '../layers/parser.js';
import { Validator } from '../layers/validator.js';
import { DiffEngine } from '../layers/diff-engine.js';
import { AIVerifier } from '../layers/ai-verifier.js';
import { Publisher } from '../layers/publisher.js';

export interface JobManagerOptions {
  /** Whether to auto-publish (default: false - requires manual approval) */
  autoPublish: boolean;
  /** User/system that created the job */
  createdBy: string;
}

/**
 * JobManager class
 * Manages the complete job lifecycle
 */
export class JobManager {
  private config: Config;
  private logger: Logger;
  private fetcher: Fetcher;
  private parser: Parser;
  private validator: Validator;
  private diffEngine: DiffEngine;
  private aiVerifier: AIVerifier;
  private publisher: Publisher;
  
  // Firestore interface (would be firebase-admin in production)
  private db: any;
  
  constructor(config: Config, logger: Logger, db?: any) {
    this.config = config;
    this.logger = logger;
    this.db = db;
    
    // Initialize all layers
    this.fetcher = new Fetcher(config, logger);
    this.parser = new Parser(logger);
    this.validator = new Validator(logger);
    this.diffEngine = new DiffEngine(logger);
    this.aiVerifier = new AIVerifier(config, logger);
    this.publisher = new Publisher(config, logger, db);
  }
  
  /**
   * Create a new fetch job
   */
  async createJob(universityName: string, country: string, urls: string[], createdBy: string = 'system'): Promise<FetchJob> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const job: FetchJob = {
      id: jobId,
      universityId: universityName.toLowerCase().replace(/\s+/g, '-'),
      universityName,
      country: country as any,
      status: JobStatus.QUEUED,
      retryCount: 0,
      maxRetries: this.config.rateLimiting.maxRetries,
      urlsFetched: [],
      programsFound: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Save job to Firestore
    if (this.db) {
      try {
        await this.db.collection('fetch_jobs').doc(jobId).set(job);
      } catch (error: any) {
        this.logger.error(`Failed to save job to Firestore`, error, { jobId });
      }
    }
    
    this.logger.info(`Job created`, {
      jobId: job.id,
      universityName,
      country,
      urls: urls.length,
    });
    
    return job;
  }
  
  /**
   * Update job status
   */
  private async updateJobStatus(job: FetchJob, status: JobStatus, error?: { message: string; code: string; retryable: boolean; blocked: boolean }): Promise<void> {
    job.status = status;
    job.updatedAt = new Date().toISOString();
    
    if (status === JobStatus.FETCHING) {
      job.startedAt = job.startedAt || new Date().toISOString();
    }
    
    if (status === JobStatus.PUBLISHED || status === JobStatus.FAILED || status === JobStatus.FAILED_BLOCKED) {
      job.completedAt = new Date().toISOString();
    }
    
    if (error) {
      job.error = error;
      if (error.blocked) {
        job.status = JobStatus.FAILED_BLOCKED;
      } else if (status === JobStatus.FAILED) {
        job.failedAt = new Date().toISOString();
      }
    }
    
    // Update in Firestore
    if (this.db) {
      try {
        await this.db.collection('fetch_jobs').doc(job.id).update({
          status: job.status,
          updatedAt: job.updatedAt,
          startedAt: job.startedAt,
          completedAt: job.completedAt,
          failedAt: job.failedAt,
          error: job.error,
        });
      } catch (error: any) {
        this.logger.error(`Failed to update job status in Firestore`, error, { jobId: job.id });
      }
    }
  }
  
  /**
   * Get previous programs for a university
   */
  private async getPreviousPrograms(universityId: string): Promise<Program[]> {
    if (!this.db) {
      return [];
    }
    
    try {
      // In production, query Firestore for previous programs
      // For now, return empty array
      return [];
    } catch (error: any) {
      this.logger.warn(`Failed to get previous programs`, { universityId, error: error.message });
      return [];
    }
  }
  
  /**
   * Execute a job through the complete pipeline
   */
  async executeJob(job: FetchJob, urls: string[], options: JobManagerOptions = { autoPublish: false, createdBy: 'system' }): Promise<{ job: FetchJob; programs: Program[]; diffResult?: DiffResult }> {
    const startTime = Date.now();
    let programs: Program[] = [];
    let diffResult: DiffResult | undefined;
    
    try {
      // STEP 1: FETCHING
      await this.updateJobStatus(job, JobStatus.FETCHING);
      this.logger.info(`Starting fetch phase`, { jobId: job.id, urlCount: urls.length });
      
      const fetchResults = await this.fetcher.fetchUrls(urls);
      job.urlsFetched = fetchResults.map(r => r.url);
      
      // Check if we were blocked
      const blockedResult = fetchResults.find(r => r.blocked);
      if (blockedResult) {
        throw {
          message: `Fetch blocked for URL: ${blockedResult.url}`,
          code: 'BLOCKED',
          retryable: false,
          blocked: true,
        };
      }
      
      // STEP 2: PARSING
      await this.updateJobStatus(job, JobStatus.PARSING);
      this.logger.info(`Starting parse phase`, { jobId: job.id });
      
      const parseResult = await this.parser.parse(fetchResults, job.universityName, job.country);
      programs = parseResult.programs;
      job.programsFound = programs.length;
      
      if (programs.length === 0) {
        this.logger.warn(`No programs found after parsing`, { jobId: job.id });
        // This is not a failure - just no data found
      }
      
      // STEP 3: VALIDATING
      await this.updateJobStatus(job, JobStatus.VALIDATING);
      this.logger.info(`Starting validation phase`, { jobId: job.id, programCount: programs.length });
      
      const validationResult = await this.validator.validate(programs);
      programs = validationResult.valid; // Only keep valid programs
      
      if (validationResult.invalid.length > 0) {
        this.logger.warn(`Some programs failed validation`, {
          jobId: job.id,
          invalidCount: validationResult.invalid.length,
        });
      }
      
      // STEP 4: DIFFING
      await this.updateJobStatus(job, JobStatus.DIFFING);
      this.logger.info(`Starting diff phase`, { jobId: job.id });
      
      const previousPrograms = await this.getPreviousPrograms(job.universityId);
      const programDiffs = await this.diffEngine.computeDiff(previousPrograms, programs);
      
      // Create diff result
      diffResult = {
        jobId: job.id,
        universityId: job.universityId,
        programDiffs,
        summary: {
          totalPrograms: programs.length,
          unchanged: programDiffs.filter(d => !d.isNew && !d.isDeleted && d.fieldDiffs.length === 0).length,
          changed: programDiffs.filter(d => !d.isNew && !d.isDeleted && d.fieldDiffs.length > 0).length,
          new: programDiffs.filter(d => d.isNew).length,
          deleted: programDiffs.filter(d => d.isDeleted).length,
          requiresReview: programDiffs.filter(d => d.requiresReview).length,
        },
        createdAt: new Date().toISOString(),
      };
      
      // STEP 5: AI VERIFICATION
      if (this.config.ai.enabled) {
        await this.updateJobStatus(job, JobStatus.AI_VERIFYING);
        this.logger.info(`Starting AI verification phase`, { jobId: job.id });
        
        const aiResult = await this.aiVerifier.verify(programs, programDiffs);
        programs = aiResult.programs;
        
        if (aiResult.requiresManualReview.length > 0) {
          this.logger.warn(`AI verification flagged programs for review`, {
            jobId: job.id,
            reviewCount: aiResult.requiresManualReview.length,
          });
        }
      }
      
      // STEP 6: READY TO PUBLISH (or PUBLISH if auto-publish enabled)
      if (options.autoPublish) {
        await this.updateJobStatus(job, JobStatus.PUBLISHED);
        this.logger.info(`Auto-publishing programs`, { jobId: job.id, programCount: programs.length });
        
        await this.publisher.publishPrograms(programs, {
          createVersionHistory: true,
          updateAuditLog: true,
          approvedBy: options.createdBy,
        });
      } else {
        await this.updateJobStatus(job, JobStatus.READY_TO_PUBLISH);
        this.logger.info(`Job ready for manual review`, {
          jobId: job.id,
          programCount: programs.length,
          requiresReview: diffResult.summary.requiresReview,
        });
      }
      
      const duration = Date.now() - startTime;
      this.logger.info(`Job execution complete`, {
        jobId: job.id,
        status: job.status,
        duration,
        programsFound: programs.length,
      });
      
      return { job, programs, diffResult };
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      this.logger.error(`Job execution failed`, error, {
        jobId: job.id,
        duration,
      });
      
      // Update job status to FAILED or FAILED_BLOCKED
      const errorInfo = error.blocked
        ? { message: error.message, code: error.code || 'UNKNOWN', retryable: false, blocked: true }
        : { message: error.message, code: error.code || 'UNKNOWN', retryable: error.retryable !== false, blocked: false };
      
      await this.updateJobStatus(job, error.blocked ? JobStatus.FAILED_BLOCKED : JobStatus.FAILED, errorInfo);
      
      throw error;
    }
  }
  
  /**
   * Manually approve and publish a job
   */
  async approveAndPublish(jobId: string, approvedBy: string, programIds?: string[]): Promise<void> {
    if (!this.db) {
      throw new Error('Firestore not initialized');
    }
    
    // Get job
    const jobDoc = await this.db.collection('fetch_jobs').doc(jobId).get();
    if (!jobDoc.exists) {
      throw new Error(`Job not found: ${jobId}`);
    }
    
    const job = jobDoc.data() as FetchJob;
    
    if (job.status !== JobStatus.READY_TO_PUBLISH) {
      throw new Error(`Job is not ready to publish. Current status: ${job.status}`);
    }
    
    // Get programs for this job (would query Firestore in production)
    // For now, this is a placeholder
    const programs: Program[] = [];
    
    // Filter programs if specific IDs provided
    const programsToPublish = programIds
      ? programs.filter(p => programIds.includes(p.id))
      : programs;
    
    // Publish
    await this.publisher.publishPrograms(programsToPublish, {
      createVersionHistory: true,
      updateAuditLog: true,
      approvedBy,
    });
    
    // Update job status
    await this.updateJobStatus(job, JobStatus.PUBLISHED);
    
    this.logger.info(`Job approved and published`, {
      jobId,
      approvedBy,
      programsPublished: programsToPublish.length,
    });
  }
}

