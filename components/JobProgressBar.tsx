/**
 * JOB PROGRESS BAR COMPONENT
 * 
 * Shows visual progress through the job lifecycle stages
 */

import React from 'react';
import { JobStatus } from '../types/core';

interface JobProgressBarProps {
  status: JobStatus;
}

const STAGES = [
  { status: 'QUEUED', label: 'Queued', step: 0 },
  { status: 'FETCHING', label: 'Fetching', step: 1 },
  { status: 'PARSING', label: 'Parsing', step: 2 },
  { status: 'VALIDATING', label: 'Validating', step: 3 },
  { status: 'DIFFING', label: 'Comparing', step: 4 },
  { status: 'AI_VERIFYING', label: 'AI Verifying', step: 5 },
  { status: 'READY_TO_PUBLISH', label: 'Ready', step: 6 },
  { status: 'PUBLISHED', label: 'Published', step: 7 },
  { status: 'FAILED', label: 'Failed', step: -1 },
  { status: 'FAILED_BLOCKED', label: 'Blocked', step: -1 },
];

export const JobProgressBar: React.FC<JobProgressBarProps> = ({ status }) => {
  const currentStage = STAGES.find(s => s.status === status);
  const currentStep = currentStage?.step ?? -1;
  const isFailed = status === 'FAILED' || status === 'FAILED_BLOCKED';
  const isComplete = status === 'PUBLISHED';
  const progressPercent = isFailed ? 0 : isComplete ? 100 : currentStep >= 0 ? ((currentStep + 1) / 7) * 100 : 0;

  const getStageColor = (step: number) => {
    if (isFailed) return 'bg-red-500';
    if (isComplete) return 'bg-green-500';
    if (step <= currentStep) return 'bg-blue-500';
    return 'bg-slate-200';
  };

  const getStageLabel = (step: number) => {
    const stage = STAGES.find(s => s.step === step);
    return stage?.label || '';
  };

  return (
    <div className="space-y-2">
      {/* Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            isFailed ? 'bg-red-500' : isComplete ? 'bg-green-500' : 'bg-blue-500'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Stage Labels */}
      <div className="flex justify-between text-xs text-slate-500">
        <span className={currentStep >= 0 ? 'font-semibold text-blue-600' : ''}>
          {getStageLabel(0)}
        </span>
        <span className={currentStep >= 1 ? 'font-semibold text-blue-600' : ''}>
          {getStageLabel(1)}
        </span>
        <span className={currentStep >= 2 ? 'font-semibold text-blue-600' : ''}>
          {getStageLabel(2)}
        </span>
        <span className={currentStep >= 3 ? 'font-semibold text-blue-600' : ''}>
          {getStageLabel(3)}
        </span>
        <span className={currentStep >= 4 ? 'font-semibold text-blue-600' : ''}>
          {getStageLabel(4)}
        </span>
        <span className={currentStep >= 5 ? 'font-semibold text-blue-600' : ''}>
          {getStageLabel(5)}
        </span>
        <span className={currentStep >= 6 ? 'font-semibold text-blue-600' : ''}>
          {getStageLabel(6)}
        </span>
      </div>

      {/* Current Status */}
      <div className="text-xs font-medium text-slate-700">
        {isFailed ? (
          <span className="text-red-600">❌ {status}</span>
        ) : isComplete ? (
          <span className="text-green-600">✅ Complete</span>
        ) : (
          <span className="text-blue-600">⏳ {currentStage?.label || status}</span>
        )}
      </div>
    </div>
  );
};

