/**
 * JOB CONTROL PANEL COMPONENT
 * 
 * Provides start/stop/pause controls for job processing
 */

import React, { useState } from 'react';
import { jobService } from '../services/jobService';
import { FetchJob } from '../types/core';

interface JobControlPanelProps {
  jobs: FetchJob[];
  onJobsUpdated?: () => void;
}

export const JobControlPanel: React.FC<JobControlPanelProps> = ({ jobs, onJobsUpdated }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'paused'>('idle');

  const handleStart = async () => {
    setIsProcessing(true);
    setStatus('processing');
    
    try {
      // Get all QUEUED jobs
      const queuedJobs = jobs.filter(job => job.status === 'QUEUED');
      
      if (queuedJobs.length === 0) {
        alert('No queued jobs to process');
        setIsProcessing(false);
        setStatus('idle');
        return;
      }

      // Process jobs sequentially
      for (const job of queuedJobs) {
        if (status === 'paused') {
          break; // Stop if paused
        }

        try {
          // Trigger processing by calling the backend
          // Since we can't directly trigger Firestore trigger, we'll use an API endpoint
          await fetch(`${import.meta.env.VITE_API_URL || 'https://api-lxdtkbqefq-uc.a.run.app'}/jobs/${job.id}/process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (error: any) {
          console.error(`Failed to process job ${job.id}:`, error);
        }
      }

      setStatus('idle');
      setIsProcessing(false);
      
      if (onJobsUpdated) {
        onJobsUpdated();
      }
    } catch (error: any) {
      console.error('Error processing jobs:', error);
      setIsProcessing(false);
      setStatus('idle');
      alert(`Error: ${error.message}`);
    }
  };

  const handleStop = () => {
    setStatus('idle');
    setIsProcessing(false);
  };

  const handlePause = () => {
    setStatus('paused');
  };

  const handleResume = () => {
    setStatus('processing');
    handleStart();
  };

  const queuedCount = jobs.filter(job => job.status === 'QUEUED').length;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 mb-1">Job Processing Controls</h3>
          <p className="text-xs text-slate-500">
            {queuedCount} job{queuedCount !== 1 ? 's' : ''} in queue
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {status === 'idle' && (
            <button
              onClick={handleStart}
              disabled={queuedCount === 0 || isProcessing}
              className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              Start Processing
            </button>
          )}

          {status === 'processing' && (
            <>
              <button
                onClick={handlePause}
                className="px-4 py-2 bg-yellow-600 text-white text-sm font-semibold rounded hover:bg-yellow-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Pause
              </button>
              <button
                onClick={handleStop}
                className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded hover:bg-red-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
                Stop
              </button>
            </>
          )}

          {status === 'paused' && (
            <>
              <button
                onClick={handleResume}
                className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded hover:bg-green-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
                Resume
              </button>
              <button
                onClick={handleStop}
                className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded hover:bg-red-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
                Stop
              </button>
            </>
          )}
        </div>
      </div>

      {status === 'processing' && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
          ⏳ Processing jobs... Please wait.
        </div>
      )}

      {status === 'paused' && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
          ⏸️ Processing paused. Click Resume to continue.
        </div>
      )}
    </div>
  );
};

