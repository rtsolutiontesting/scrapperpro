# Why Jobs Are Not Progressing

## ❌ Current Issue

Jobs are stuck in QUEUED status even after the backend fix.

## 🔍 Root Cause

The fix we implemented processes jobs asynchronously AFTER the HTTP response is sent:

```typescript
// Process job immediately (async, non-blocking)
jobManager.executeJob(job, urls, {...}).catch(...);
res.status(201).json({ job }); // HTTP response sent
```

**Problem:** Firebase Functions terminate when the HTTP response is sent. The async processing never completes!

## ✅ Solution Needed

We need to use a **Firestore Trigger Function** that:
1. Triggers when a job document is created with `status: QUEUED`
2. Processes the job in a separate function instance
3. Updates the job status as it progresses

OR

Process the job **synchronously** (but this risks timeout for long jobs).

---

## 🎯 Recommended Fix: Firestore Trigger

Create a separate Cloud Function that triggers on job creation:

```typescript
export const processJob = onDocumentCreated(
  'fetch_jobs/{jobId}',
  async (event) => {
    const job = event.data?.data() as FetchJob;
    if (job.status === 'QUEUED') {
      // Process the job
      await jobManager.executeJob(...);
    }
  }
);
```

This ensures jobs are processed even after the HTTP response is sent.

