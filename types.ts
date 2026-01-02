/**
 * Legacy types for backward compatibility
 * New code should use types from ./types/core.ts
 */

// Re-export core types
export * from './types/core';

// Legacy types for frontend compatibility (deprecated)
export enum ProgramLevel {
  UG = 'Undergraduate',
  PG = 'Postgraduate',
  PHD = 'PhD'
}

export interface ProgramData {
  id: string;
  universityName: string;
  country: 'Canada' | 'UK';
  programName: string;
  level: ProgramLevel;
  tuitionFee: string;
  applicationFee: string;
  ieltsScore: string;
  toeflScore: string;
  admissionRequirements: string;
  indianAcademicReq: string;
  indianScholarships: string;
  backlogPolicy: string;
  deadline: string;
  sourceUrl: string;
}

export interface ScrapingTask {
  university: string;
  country: 'Canada' | 'UK';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  data?: ProgramData[];
}

export interface DashboardStats {
  totalScraped: number;
  averageTuition: number;
  countriesCount: { [key: string]: number };
}
