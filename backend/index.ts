/**
 * BACKEND ENTRY POINT
 * 
 * Firebase Functions / Cloud Run entry point for the data ingestion engine.
 * 
 * This runs server-side and handles all data fetching, processing, and publishing.
 * Frontend only makes API calls to this backend.
 */

import { getConfig, validateConfig } from './config';
import { createLogger } from './utils/logger';
import { JobManager } from './job/job-manager';
import { JobQueue } from './job/job-queue';

// In production, import from firebase-admin
// import * as admin from 'firebase-admin';
// admin.initializeApp();

/**
 * Initialize backend services
 */
function initializeBackend() {
  const config = getConfig();
  validateConfig(config);
  
  const logger = createLogger(config);
  const db = null; // Would be: admin.firestore()
  
  const jobManager = new JobManager(config, logger, db);
  const jobQueue = new JobQueue(config, logger, jobManager);
  
  return {
    config,
    logger,
    db,
    jobManager,
    jobQueue,
  };
}

/**
 * Firebase Cloud Function / Cloud Run HTTP handler
 * 
 * In production, this would be:
 * - Firebase Functions: exports.api = functions.https.onRequest(handler);
 * - Cloud Run: Express app with routes
 */
export async function handler(req: any, res: any): Promise<void> {
  const services = initializeBackend();
  const { logger } = services;
  
  try {
    const { method, path, body } = req;
    
    logger.info(`API request`, { method, path });
    
    // Route handling
    if (method === 'GET' && path === '/health') {
      res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
      return;
    }
    
    if (method === 'POST' && path === '/jobs/create') {
      const { universityName, country, urls, autoPublish, createdBy } = body;
      
      if (!universityName || !country || !urls || !Array.isArray(urls)) {
        res.status(400).json({ error: 'Missing required fields: universityName, country, urls' });
        return;
      }
      
      const job = await services.jobManager.createJob(
        universityName,
        country,
        urls,
        createdBy || 'system'
      );
      
      await services.jobQueue.enqueue(job, urls, {
        autoPublish: autoPublish || false,
        createdBy: createdBy || 'system',
      });
      
      res.status(201).json({ job });
      return;
    }
    
    if (method === 'GET' && path.startsWith('/jobs/')) {
      const jobId = path.split('/')[2];
      
      // Get job from Firestore
      if (services.db) {
        const jobDoc = await services.db.collection('fetch_jobs').doc(jobId).get();
        if (jobDoc.exists) {
          res.status(200).json({ job: jobDoc.data() });
          return;
        }
      }
      
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    
    if (method === 'POST' && path.startsWith('/jobs/') && path.endsWith('/approve')) {
      const jobId = path.split('/')[2];
      const { approvedBy, programIds } = body;
      
      if (!approvedBy) {
        res.status(400).json({ error: 'Missing required field: approvedBy' });
        return;
      }
      
      await services.jobManager.approveAndPublish(jobId, approvedBy, programIds);
      
      res.status(200).json({ success: true });
      return;
    }
    
    if (method === 'GET' && path === '/queue/status') {
      const status = services.jobQueue.getStatus();
      res.status(200).json(status);
      return;
    }
    
    res.status(404).json({ error: 'Not found' });
    
  } catch (error: any) {
    logger.error('API error', error, { path: req.path });
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

// For Cloud Run / Express compatibility
export default handler;


