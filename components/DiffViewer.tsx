/**
 * DIFF VIEWER COMPONENT
 * 
 * Displays field-by-field changes for a job
 */

import React from 'react';
import { ProgramDiff, FieldDiff, FieldChangeType } from '../types/core';

interface DiffViewerProps {
  diffs: ProgramDiff[];
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ diffs }) => {
  const getChangeTypeColor = (type: FieldChangeType): string => {
    switch (type) {
      case 'newly_added':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'changed':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'missing':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'unchanged':
        return 'bg-slate-50 border-slate-200 text-slate-600';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };
  
  const getChangeTypeIcon = (type: FieldChangeType): string => {
    switch (type) {
      case 'newly_added':
        return '+';
      case 'changed':
        return '~';
      case 'missing':
        return '-';
      case 'unchanged':
        return '=';
      default:
        return '';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">Changes Detected</h2>
        <div className="text-sm text-slate-500">
          {diffs.filter(d => d.fieldDiffs.length > 0 || d.isNew || d.isDeleted).length} programs with changes
        </div>
      </div>
      
      {diffs.map((programDiff) => {
        if (programDiff.isDeleted) {
          return (
            <div key={programDiff.programId} className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="font-semibold text-red-800 mb-2">Program Deleted</div>
              <div className="text-sm text-red-600">Program ID: {programDiff.programId}</div>
            </div>
          );
        }
        
        if (programDiff.fieldDiffs.length === 0 && !programDiff.isNew) {
          return null; // Skip unchanged programs
        }
        
        return (
          <div
            key={programDiff.programId}
            className={`p-4 border rounded-lg ${
              programDiff.requiresReview
                ? 'border-orange-300 bg-orange-50'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                {programDiff.isNew && (
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded mb-2">
                    NEW PROGRAM
                  </span>
                )}
                <div className="font-semibold text-slate-900">Program: {programDiff.programId}</div>
              </div>
              <div className="text-xs text-slate-500">
                Confidence: {programDiff.overallConfidence.toFixed(0)}%
              </div>
            </div>
            
            {programDiff.fieldDiffs.length > 0 && (
              <div className="space-y-2">
                {programDiff.fieldDiffs.map((fieldDiff, idx) => (
                  <div
                    key={idx}
                    className={`p-3 border rounded ${getChangeTypeColor(fieldDiff.changeType)}`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="font-medium">{fieldDiff.fieldName}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono">{getChangeTypeIcon(fieldDiff.changeType)}</span>
                        <span className="text-xs opacity-75">
                          {fieldDiff.confidenceScore.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    
                    {fieldDiff.previousValue !== undefined && (
                      <div className="text-xs opacity-75 line-through mb-1">
                        Previous: {String(fieldDiff.previousValue)}
                      </div>
                    )}
                    
                    {fieldDiff.newValue !== undefined && (
                      <div className="text-xs font-medium">
                        New: {String(fieldDiff.newValue)}
                      </div>
                    )}
                    
                    {fieldDiff.requiresReview && (
                      <div className="mt-1 text-xs font-semibold text-orange-700">
                        ⚠ Requires manual review
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      
      {diffs.filter(d => d.fieldDiffs.length > 0 || d.isNew || d.isDeleted).length === 0 && (
        <div className="text-center py-8 text-slate-400">
          No changes detected
        </div>
      )}
    </div>
  );
};


