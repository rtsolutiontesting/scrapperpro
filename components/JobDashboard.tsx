/**
 * JOB DASHBOARD COMPONENT
 * 
 * Displays job queue and status
 */

import React from 'react';
import { FetchJob, JobStatus } from '../types/core';

interface JobDashboardProps {
  jobs: FetchJob[];
  onApproveJob: (jobId: string) => void;
  selectedJobId: string | null;
  onSelectJob: (jobId: string | null) => void;
}

export const JobDashboard: React.FC<JobDashboardProps> = ({
  jobs,
  onApproveJob,
  selectedJobId,
  onSelectJob,
}) => {
  const getStatusBadge = (status: JobStatus) => {
    const styles: Record<JobStatus, string> = {
      [JobStatus.QUEUED]: 'bg-slate-100 text-slate-700',
      [JobStatus.FETCHING]: 'bg-blue-100 text-blue-700 animate-pulse',
      [JobStatus.PARSING]: 'bg-purple-100 text-purple-700',
      [JobStatus.VALIDATING]: 'bg-indigo-100 text-indigo-700',
      [JobStatus.DIFFING]: 'bg-yellow-100 text-yellow-700',
      [JobStatus.AI_VERIFYING]: 'bg-pink-100 text-pink-700',
      [JobStatus.READY_TO_PUBLISH]: 'bg-green-100 text-green-700',
      [JobStatus.PUBLISHED]: 'bg-green-500 text-white',
      [JobStatus.FAILED]: 'bg-red-100 text-red-700',
      [JobStatus.FAILED_BLOCKED]: 'bg-red-500 text-white',
    };
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${styles[status]}`}>
        {status}
      </span>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">Job Queue</h2>
        <span className="text-sm text-slate-500">{jobs.length} jobs</span>
      </div>
      
      <div className="space-y-2">
        {jobs.map((job) => (
          <div
            key={job.id}
            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
              selectedJobId === job.id
                ? 'border-orange-500 bg-orange-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
            onClick={() => onSelectJob(job.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-slate-900">{job.universityName}</h3>
                <p className="text-sm text-slate-500">{job.country}</p>
              </div>
              {getStatusBadge(job.status)}
            </div>
            
            <div className="flex justify-between items-center text-xs text-slate-500 mt-2">
              <span>Programs: {job.programsFound}</span>
              <span>URLs: {job.urlsFetched.length}</span>
              {job.createdAt && (
                <span>{new Date(job.createdAt).toLocaleString()}</span>
              )}
            </div>
            
            {job.error && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                {job.error.message}
              </div>
            )}
            
            {job.status === JobStatus.READY_TO_PUBLISH && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onApproveJob(job.id);
                }}
                className="mt-2 w-full px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700"
              >
                Approve & Publish
              </button>
            )}
          </div>
        ))}
        
        {jobs.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            No jobs in queue
          </div>
        )}
      </div>
    </div>
  );
};


