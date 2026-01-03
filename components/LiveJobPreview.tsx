/**
 * LIVE JOB PREVIEW COMPONENT
 * 
 * Shows real-time processing logs and status for selected job
 */

import React, { useEffect, useState } from 'react';
import { FetchJob } from '../types/core';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface LiveJobPreviewProps {
  jobId: string | null;
  job: FetchJob | null;
}

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

export const LiveJobPreview: React.FC<LiveJobPreviewProps> = ({ jobId, job }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (!jobId || !job) {
      setLogs([]);
      return;
    }

    // Generate logs from job status
    const generateLogs = (jobData: FetchJob): LogEntry[] => {
      const jobLogs: LogEntry[] = [];
      
      jobLogs.push({
        timestamp: new Date(jobData.createdAt).toLocaleTimeString(),
        message: `Job created: ${jobData.universityName} (${jobData.country})`,
        type: 'info',
      });

      if (jobData.status === 'QUEUED') {
        jobLogs.push({
          timestamp: new Date().toLocaleTimeString(),
          message: '⏳ Waiting in queue...',
          type: 'info',
        });
      }

      if (jobData.status === 'FETCHING') {
        jobLogs.push({
          timestamp: new Date().toLocaleTimeString(),
          message: `📥 Fetching data from ${jobData.urlsFetched?.length || 0} URL(s)...`,
          type: 'info',
        });
      }

      if (jobData.status === 'PARSING') {
        jobLogs.push({
          timestamp: new Date().toLocaleTimeString(),
          message: `🔍 Parsing HTML content and extracting program data...`,
          type: 'info',
        });
      }

      if (jobData.status === 'VALIDATING') {
        jobLogs.push({
          timestamp: new Date().toLocaleTimeString(),
          message: `✅ Validating ${jobData.programsFound || 0} program(s)...`,
          type: 'info',
        });
      }

      if (jobData.status === 'DIFFING') {
        jobLogs.push({
          timestamp: new Date().toLocaleTimeString(),
          message: `🔀 Comparing with previous data...`,
          type: 'info',
        });
      }

      if (jobData.status === 'AI_VERIFYING') {
        jobLogs.push({
          timestamp: new Date().toLocaleTimeString(),
          message: `🤖 AI verification in progress...`,
          type: 'info',
        });
      }

      if (jobData.status === 'READY_TO_PUBLISH') {
        jobLogs.push({
          timestamp: new Date(jobData.completedAt || new Date().toISOString()).toLocaleTimeString(),
          message: `✨ Ready to publish! Found ${jobData.programsFound || 0} program(s)`,
          type: 'success',
        });
      }

      if (jobData.status === 'PUBLISHED') {
        jobLogs.push({
          timestamp: new Date(jobData.completedAt || new Date().toISOString()).toLocaleTimeString(),
          message: `🎉 Published successfully!`,
          type: 'success',
        });
      }

      if (jobData.status === 'FAILED' || jobData.status === 'FAILED_BLOCKED') {
        jobLogs.push({
          timestamp: new Date(jobData.failedAt || new Date().toISOString()).toLocaleTimeString(),
          message: `❌ Failed: ${jobData.error?.message || 'Unknown error'}`,
          type: 'error',
        });
      }

      return jobLogs;
    };

    // Set initial logs
    setLogs(generateLogs(job));

    // Subscribe to job updates
    const unsubscribe = onSnapshot(
      doc(db, 'fetch_jobs', jobId),
      (snapshot) => {
        if (snapshot.exists()) {
          const jobData = { id: snapshot.id, ...snapshot.data() } as FetchJob;
          setLogs(generateLogs(jobData));
        }
      },
      (error) => {
        console.error('Error subscribing to job:', error);
        setLogs(prev => [...prev, {
          timestamp: new Date().toLocaleTimeString(),
          message: 'Error loading job updates',
          type: 'error',
        }]);
      }
    );

    return () => unsubscribe();
  }, [jobId, job]);

  if (!jobId || !job) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center text-slate-400">
        Select a job to view live progress
      </div>
    );
  }

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-slate-100"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-slate-800">Live Processing Preview</h3>
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
            {job.universityName}
          </span>
        </div>
        <button className="text-slate-500 hover:text-slate-700">
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              No activity yet...
            </div>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${getLogColor(log.type)}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{log.message}</div>
                  </div>
                  <div className="text-xs opacity-75">{log.timestamp}</div>
                </div>
              </div>
            ))
          )}

          {/* Auto-scroll to bottom */}
          {logs.length > 0 && (
            <div className="text-xs text-slate-400 text-center pt-2 border-t border-slate-100">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

