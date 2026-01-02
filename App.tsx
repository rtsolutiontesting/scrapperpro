/**
 * MAIN APP COMPONENT (REFACTORED)
 * 
 * Production-grade control panel for the university data ingestion engine.
 * 
 * Frontend responsibilities:
 * - Display job queue and status
 * - Show diff viewer for changes
 * - Manual approve/reject before publish
 * - Real-time updates from Firestore
 * 
 * Frontend does NOT:
 * - Scrape data directly (all happens server-side)
 * - Call AI APIs directly
 * - Write to Firebase directly (only reads for display)
 */

import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import { JobDashboard } from './components/JobDashboard';
import { DiffViewer } from './components/DiffViewer';
import { UniversityManager } from './components/UniversityManager';
import { CANADA_UNIVERSITIES, UK_UNIVERSITIES } from './constants';
import { FetchJob, JobStatus } from './types/core';
import { jobService } from './services/jobService';
import { getUniversityUrls } from './utils/universityUrls';

const App: React.FC = () => {
  const [jobs, setJobs] = useState<FetchJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'queue' | 'diffs' | 'stats'>('queue');
  const [queueStatus, setQueueStatus] = useState({ queueSize: 0, isProcessing: false, currentJobId: null as string | null });
  
  // Get selected job
  const selectedJob = useMemo(() => {
    return jobs.find(j => j.id === selectedJobId) || null;
  }, [jobs, selectedJobId]);
  
  // Subscribe to jobs from Firestore
  useEffect(() => {
    const unsubscribe = jobService.subscribeToJobs((updatedJobs) => {
      setJobs(updatedJobs);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Poll queue status
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const status = await jobService.getQueueStatus();
        setQueueStatus(status);
      } catch (error) {
        console.error('Failed to get queue status:', error);
      }
    }, 5000); // Poll every 5 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Create a new job for a university
  const createJobForUniversity = async (universityName: string, country: string) => {
    try {
      const urls = getUniversityUrls(universityName, country);
      
      if (urls.length === 0) {
        alert(`No URLs found for ${universityName}. Please configure URLs manually.`);
        return;
      }
      
      const job = await jobService.createJob({
        universityName,
        country,
        urls,
        autoPublish: false, // Always require manual approval
        createdBy: 'user',
      });
      
      console.log('Job created:', job);
    } catch (error: any) {
      console.error('Failed to create job:', error);
      alert(`Failed to create job: ${error.message}`);
    }
  };
  
  // Approve and publish a job
  const handleApproveJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to approve and publish this job?')) {
      return;
    }
    
    try {
      await jobService.approveJob(jobId, {
        approvedBy: 'user',
      });
      
      alert('Job approved and published successfully');
    } catch (error: any) {
      console.error('Failed to approve job:', error);
      alert(`Failed to approve job: ${error.message}`);
    }
  };
  
  // Statistics
  const stats = useMemo(() => {
    return {
      total: jobs.length,
      queued: jobs.filter(j => j.status === JobStatus.QUEUED).length,
      processing: jobs.filter(j => [
        JobStatus.FETCHING,
        JobStatus.PARSING,
        JobStatus.VALIDATING,
        JobStatus.DIFFING,
        JobStatus.AI_VERIFYING,
      ].includes(j.status)).length,
      readyToPublish: jobs.filter(j => j.status === JobStatus.READY_TO_PUBLISH).length,
      published: jobs.filter(j => j.status === JobStatus.PUBLISHED).length,
      failed: jobs.filter(j => j.status === JobStatus.FAILED || j.status === JobStatus.FAILED_BLOCKED).length,
      totalPrograms: jobs.reduce((sum, j) => sum + j.programsFound, 0),
    };
  }, [jobs]);
  
  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center justify-between">
              System Status
              <span className={`h-2 w-2 rounded-full ${
                queueStatus.isProcessing ? 'bg-amber-500 animate-ping' : 'bg-green-500'
              }`}></span>
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Total Jobs</span>
                <span className="font-semibold">{stats.total}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Processing</span>
                <span className="text-blue-600 font-semibold">{stats.processing}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Ready to Publish</span>
                <span className="text-green-600 font-semibold">{stats.readyToPublish}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Published</span>
                <span className="text-indigo-600 font-semibold">{stats.published}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Failed</span>
                <span className="text-red-600 font-semibold">{stats.failed}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t">
                <span className="text-slate-500">Total Programs</span>
                <span className="font-semibold">{stats.totalPrograms}</span>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-slate-900 rounded-xl p-6 text-white">
            <h3 className="font-bold mb-4">Quick Actions</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              All data fetching happens server-side. This panel is for monitoring and approval only.
            </p>
          </div>
          
          {/* Bulk Upload Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <UniversityManager />
          </div>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            {(['queue', 'diffs', 'stats'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-semibold transition-colors relative ${
                  activeTab === tab ? 'text-orange-600' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.toUpperCase()}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"></div>
                )}
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm min-h-[600px] p-6">
            {activeTab === 'queue' && (
              <JobDashboard
                jobs={jobs}
                onApproveJob={handleApproveJob}
                selectedJobId={selectedJobId}
                onSelectJob={setSelectedJobId}
              />
            )}
            
            {activeTab === 'diffs' && (
              <div>
                {selectedJob ? (
                  <div>
                    <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                      <h3 className="font-semibold">{selectedJob.universityName}</h3>
                      <p className="text-sm text-slate-500">Job ID: {selectedJob.id}</p>
                      <p className="text-sm text-slate-500">Status: {selectedJob.status}</p>
                    </div>
                    {/* Diff viewer would go here - would need to fetch diff data from Firestore */}
                    <div className="text-center py-8 text-slate-400">
                      Diff viewer - fetch diff data from Firestore collection 'diff_results'
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    Select a job from the queue to view diffs
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'stats' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-800">Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                    <div className="text-sm text-slate-500">Total Jobs</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900">{stats.processing}</div>
                    <div className="text-sm text-blue-600">Processing</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-900">{stats.readyToPublish}</div>
                    <div className="text-sm text-green-600">Ready to Publish</div>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-900">{stats.published}</div>
                    <div className="text-sm text-indigo-600">Published</div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-900">{stats.failed}</div>
                    <div className="text-sm text-red-600">Failed</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-900">{stats.totalPrograms}</div>
                    <div className="text-sm text-purple-600">Total Programs</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default App;

