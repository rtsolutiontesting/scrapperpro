/**
 * FIREBASE FUNCTIONS ENTRY POINT
 * 
 * This is the entry point for Firebase Cloud Functions.
 * Firebase Functions automatically handles HTTP requests.
 */

import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getConfig, validateConfig } from '../config.js';
import { createLogger } from '../utils/logger.js';
import { JobManager } from '../job/job-manager.js';
import { JobQueue } from '../job/job-queue.js';
import { FetchJob, JobStatus } from '../types/core.js';
import express, { Request, Response } from 'express';
import cors from 'cors';

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

// Initialize backend services
const config = getConfig();
validateConfig(config);
const logger = createLogger(config);
const jobManager = new JobManager(config, logger, db);
const jobQueue = new JobQueue(config, logger, jobManager);

// Create Express app
const app = express();

// Enable CORS and JSON body parsing
app.use(cors({ origin: true }) as express.RequestHandler);
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create job
app.post('/jobs/create', async (req: Request, res: Response) => {
  try {
    const { universityName, country, urls, autoPublish, createdBy } = req.body;
    
    if (!universityName || !country || !urls || !Array.isArray(urls)) {
      res.status(400).json({ error: 'Missing required fields: universityName, country, urls' });
      return;
    }
    
    const job = await jobManager.createJob(
      universityName,
      country,
      urls,
      createdBy || 'system'
    );
    
    // Store URLs and options in Firestore for processing
    // The Firestore trigger (processJob) will process the job
    await db.collection('fetch_jobs').doc(job.id).update({
      urlsToFetch: urls,
      autoPublish: autoPublish || false,
      createdBy: createdBy || 'system',
    });
    
    res.status(201).json({ job });
  } catch (error: any) {
    logger.error('API error: create job', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get job
app.get('/jobs/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const jobDoc = await db.collection('fetch_jobs').doc(jobId).get();
    
    if (!jobDoc.exists) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    
    res.status(200).json({ job: { id: jobDoc.id, ...jobDoc.data() } });
  } catch (error: any) {
    logger.error('API error: get job', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Approve job
app.post('/jobs/:jobId/approve', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const { approvedBy, programIds } = req.body;
    
    if (!approvedBy) {
      res.status(400).json({ error: 'Missing required field: approvedBy' });
      return;
    }
    
    await jobManager.approveAndPublish(jobId, approvedBy, programIds);
    
    res.status(200).json({ success: true });
  } catch (error: any) {
    logger.error('API error: approve job', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get queue status
app.get('/queue/status', async (req: Request, res: Response) => {
  try {
    const status = jobQueue.getStatus();
    res.status(200).json(status);
  } catch (error: any) {
    logger.error('API error: queue status', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Export as Firebase Function
export const api = onRequest({
  region: 'us-central1', // Change to your preferred region
  timeoutSeconds: 540, // 9 minutes (max for v2 functions)
  memory: '512MiB',
  cors: true,
}, app);

// Firestore Trigger: Process jobs when created with QUEUED status
export const processJob = onDocumentCreated(
  {
    document: 'fetch_jobs/{jobId}',
    region: 'us-central1',
    timeoutSeconds: 540,
    memory: '512MiB',
  },
  async (event) => {
    const jobId = event.params.jobId;
    const jobData = event.data?.data() as FetchJob | undefined;
    
    if (!jobData) {
      console.error('No job data found', { jobId });
      return;
    }
    
    // Only process jobs with QUEUED status
    if (jobData.status !== JobStatus.QUEUED) {
      console.log('Job not in QUEUED status, skipping', { jobId, status: jobData.status });
      return;
    }
    
    // Initialize services for this function instance
    const config = getConfig();
    validateConfig(config);
    const logger = createLogger(config);
    const jobManager = new JobManager(config, logger, db);
    
    // Get URLs and options from job document
    const jobDoc = await db.collection('fetch_jobs').doc(jobId).get();
    const fullJobData = jobDoc.data() as any;
    const urls = fullJobData.urlsToFetch || jobData.urlsFetched || [];
    const autoPublish = fullJobData.autoPublish || false;
    const createdBy = fullJobData.createdBy || 'system';
    
    if (urls.length === 0) {
      logger.warn('No URLs to fetch', { jobId });
      await db.collection('fetch_jobs').doc(jobId).update({
        status: JobStatus.FAILED,
        error: {
          message: 'No URLs provided',
          code: 'NO_URLS',
          retryable: false,
          blocked: false,
        },
        failedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return;
    }
    
    logger.info('Processing job from Firestore trigger', {
      jobId,
      universityName: jobData.universityName,
      urlCount: urls.length,
    });
    
    try {
      // Execute the job
      await jobManager.executeJob(jobData, urls, {
        autoPublish,
        createdBy,
      });
      
      logger.info('Job processing completed', { jobId });
    } catch (error: any) {
      logger.error('Job processing failed in trigger', error, { jobId });
      // Error handling is done in JobManager.executeJob
    }
  }
);

