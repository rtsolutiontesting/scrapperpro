/**
 * JOB ETA COMPONENT
 * 
 * Shows estimated time remaining for job processing
 */

import React from 'react';
import { JobStatus } from '../types/core';

interface JobETAProps {
  status: JobStatus;
  createdAt?: string;
  startedAt?: string;
}

// Estimated durations for each stage (in seconds)
const STAGE_DURATIONS: Record<JobStatus, number> = {
  QUEUED: 0, // No processing time for queued
  FETCHING: 60, // ~1 minute
  PARSING: 60, // ~1 minute
  VALIDATING: 30, // ~30 seconds
  DIFFING: 30, // ~30 seconds
  AI_VERIFYING: 90, // ~1.5 minutes
  READY_TO_PUBLISH: 0, // Complete
  PUBLISHED: 0, // Complete
  FAILED: 0, // Failed
  FAILED_BLOCKED: 0, // Failed
};

// Total estimated time for full pipeline (in seconds)
const TOTAL_ESTIMATED_TIME = Object.values(STAGE_DURATIONS).reduce((sum, duration) => sum + duration, 0);

const STAGE_ORDER: JobStatus[] = [
  'QUEUED',
  'FETCHING',
  'PARSING',
  'VALIDATING',
  'DIFFING',
  'AI_VERIFYING',
  'READY_TO_PUBLISH',
  'PUBLISHED',
];

export const JobETA: React.FC<JobETAProps> = ({ status, createdAt, startedAt }) => {
  const calculateETA = (): { remaining: number; formatted: string } | null => {
    // If job is complete or failed, no ETA
    if (status === 'PUBLISHED' || status === 'READY_TO_PUBLISH' || status === 'FAILED' || status === 'FAILED_BLOCKED') {
      return null;
    }

    // If job is queued and hasn't started, estimate full pipeline time
    if (status === 'QUEUED') {
      return {
        remaining: TOTAL_ESTIMATED_TIME,
        formatted: formatDuration(TOTAL_ESTIMATED_TIME),
      };
    }

    // Calculate remaining time based on current stage
    const currentStageIndex = STAGE_ORDER.indexOf(status);
    if (currentStageIndex === -1) return null;

    let remainingTime = 0;
    for (let i = currentStageIndex; i < STAGE_ORDER.length; i++) {
      const stageStatus = STAGE_ORDER[i];
      remainingTime += STAGE_DURATIONS[stageStatus] || 0;
    }

    // If job has started, calculate based on elapsed time
    if (startedAt) {
      const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000;
      const currentStageDuration = STAGE_DURATIONS[status] || 0;
      const progressInStage = Math.min(elapsed / currentStageDuration, 1);
      const remainingInCurrentStage = currentStageDuration * (1 - progressInStage);
      remainingTime = remainingInCurrentStage + remainingTime - currentStageDuration;
    }

    return {
      remaining: Math.max(0, remainingTime),
      formatted: formatDuration(remainingTime),
    };
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const secs = Math.round(seconds % 60);
      return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  };

  const eta = calculateETA();

  if (!eta) {
    if (status === 'PUBLISHED' || status === 'READY_TO_PUBLISH') {
      return (
        <span className="text-xs text-green-600 font-medium">
          ✅ Complete
        </span>
      );
    }
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-slate-500">ETA:</span>
      <span className="font-semibold text-blue-600">{eta.formatted}</span>
      {status === 'QUEUED' && (
        <span className="text-slate-400">(estimated)</span>
      )}
    </div>
  );
};

