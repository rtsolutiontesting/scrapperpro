/**
 * CORE DATA MODELS
 * 
 * These interfaces define the complete data structure for the university data engine.
 * Each field must store source tracking information for auditability.
 */

/**
 * Verification method used to obtain or validate a field value
 */
export type VerificationMethod = 'direct' | 'inferred' | 'ai_verified';

/**
 * Source metadata for every field
 * Tracks where data came from and how confident we are
 */
export interface SourceMeta {
  /** URL where this data was found */
  sourceUrl: string;
  /** Timestamp when data was fetched */
  fetchedAt: string; // ISO 8601 timestamp
  /** Confidence score 0-100 (100 = highest confidence) */
  confidenceScore: number;
  /** How this field was obtained/verified */
  verificationMethod: VerificationMethod;
  /** Optional notes about the source */
  notes?: string;
}

/**
 * Field value with source metadata
 * Every data field is wrapped in this structure
 */
export interface FieldWithSource<T> {
  value: T;
  source: SourceMeta;
}

/**
 * Program level enumeration
 */
export enum ProgramLevel {
  UG = 'Undergraduate',
  PG = 'Postgraduate',
  PHD = 'PhD'
}

/**
 * Intake/term enumeration
 */
export enum IntakeTerm {
  FALL = 'Fall',
  SPRING = 'Spring',
  SUMMER = 'Summer',
  WINTER = 'Winter'
}

/**
 * Country enumeration
 */
export type Country = 'Canada' | 'UK' | 'USA' | 'Australia' | 'Other';

/**
 * Deadlines for a program intake
 * Each deadline is tracked with source metadata
 */
export interface Deadline {
  /** Deadline date (ISO 8601) */
  date: FieldWithSource<string>;
  /** Type of deadline (application, document submission, etc.) */
  type: 'application' | 'document' | 'deposit' | 'registration' | 'other';
  /** Notes about the deadline */
  notes?: string;
}

/**
 * Intake information for a program
 * Programs can have multiple intakes per year
 */
export interface Intake {
  /** Intake term */
  term: IntakeTerm;
  /** Year (e.g., 2024, 2025) */
  year: number;
  /** Deadlines for this intake */
  deadlines: Deadline[];
  /** Whether this intake is currently accepting applications */
  isActive: FieldWithSource<boolean>;
}

/**
 * Comprehensive Program data structure
 * All fields are optional except core identifiers
 * Missing data is represented as null, never hallucinated
 */
export interface Program {
  /** Unique program identifier */
  id: string;
  
  /** Core identifiers (required) */
  universityName: FieldWithSource<string>;
  programName: FieldWithSource<string>;
  level: ProgramLevel;
  country: Country;
  
  /** Financial information */
  tuitionFee?: FieldWithSource<string>; // Local currency
  applicationFee?: FieldWithSource<string>;
  
  /** Language requirements */
  ieltsScore?: FieldWithSource<string>;
  toeflScore?: FieldWithSource<string>;
  languageWaiver?: FieldWithSource<string>;
  
  /** Academic requirements - general */
  admissionRequirements?: FieldWithSource<string>;
  
  /** Academic requirements - India-specific */
  indianAcademicReq?: FieldWithSource<string>; // CBSE/ICSE/State Board requirements
  backlogPolicy?: FieldWithSource<string>; // Backlog/re-attempt policy
  
  /** Scholarships */
  indianScholarships?: FieldWithSource<string>;
  
  /** Intake information */
  intakes: Intake[];
  
  /** Timestamps */
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  lastVerifiedAt?: string; // ISO 8601
}

/**
 * University information
 */
export interface University {
  /** Unique university identifier */
  id: string;
  
  /** Core information */
  name: FieldWithSource<string>;
  country: Country;
  
  /** Official website URL */
  officialWebsite: FieldWithSource<string>;
  
  /** Known admission-related URLs */
  admissionUrls: string[];
  
  /** Timestamps */
  createdAt: string;
  updatedAt: string;
  lastFetchedAt?: string;
}

/**
 * Job lifecycle states
 * Jobs progress through these states in sequence
 */
export enum JobStatus {
  QUEUED = 'QUEUED',
  FETCHING = 'FETCHING',
  PARSING = 'PARSING',
  VALIDATING = 'VALIDATING',
  DIFFING = 'DIFFING',
  AI_VERIFYING = 'AI_VERIFYING',
  READY_TO_PUBLISH = 'READY_TO_PUBLISH',
  PUBLISHED = 'PUBLISHED',
  FAILED = 'FAILED',
  FAILED_BLOCKED = 'FAILED_BLOCKED' // Rate limited or blocked, requires manual review
}

/**
 * Fetch job metadata
 * Tracks the lifecycle of a data fetch operation
 */
export interface FetchJob {
  /** Unique job identifier */
  id: string;
  
  /** University being fetched */
  universityId: string;
  universityName: string;
  country: Country;
  
  /** Job state */
  status: JobStatus;
  
  /** Progress tracking */
  startedAt?: string; // ISO 8601
  completedAt?: string; // ISO 8601
  failedAt?: string; // ISO 8601
  
  /** Error information (if failed) */
  error?: {
    message: string;
    code: string;
    retryable: boolean;
    blocked: boolean; // Set to true if we got 403/429
  };
  
  /** Retry metadata */
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: string; // ISO 8601
  
  /** URLs fetched */
  urlsFetched: string[];
  
  /** Programs found */
  programsFound: number;
  
  /** Job metadata */
  createdAt: string;
  updatedAt: string;
}

/**
 * Type of field change detected
 */
export type FieldChangeType = 'unchanged' | 'changed' | 'missing' | 'newly_added';

/**
 * Individual field diff
 * Represents a change in a single field
 */
export interface FieldDiff {
  /** Field name (e.g., 'tuitionFee', 'deadline') */
  fieldName: string;
  
  /** Type of change */
  changeType: FieldChangeType;
  
  /** Previous value (if changed or missing) */
  previousValue?: any;
  previousSource?: SourceMeta;
  
  /** New value (if changed or newly added) */
  newValue?: any;
  newSource?: SourceMeta;
  
  /** Confidence score for the change */
  confidenceScore: number;
  
  /** Whether this change needs manual review */
  requiresReview: boolean;
}

/**
 * Program-level diff
 * Aggregates all field changes for a program
 */
export interface ProgramDiff {
  /** Program ID */
  programId: string;
  
  /** Whether this is a new program */
  isNew: boolean;
  
  /** Whether this program was deleted/removed */
  isDeleted: boolean;
  
  /** Field-level changes */
  fieldDiffs: FieldDiff[];
  
  /** Overall confidence score */
  overallConfidence: number;
  
  /** Whether this program needs manual review */
  requiresReview: boolean;
}

/**
 * Complete diff result for a fetch job
 */
export interface DiffResult {
  /** Job ID */
  jobId: string;
  
  /** University ID */
  universityId: string;
  
  /** Program-level diffs */
  programDiffs: ProgramDiff[];
  
  /** Summary statistics */
  summary: {
    totalPrograms: number;
    unchanged: number;
    changed: number;
    new: number;
    deleted: number;
    requiresReview: number;
  };
  
  /** Timestamp */
  createdAt: string;
}

/**
 * Confidence score breakdown
 */
export interface ConfidenceScore {
  /** Overall confidence (0-100) */
  overall: number;
  
  /** Confidence by category */
  byCategory: {
    financial: number;
    requirements: number;
    deadlines: number;
    scholarships: number;
  };
  
  /** Factors affecting confidence */
  factors: {
    hasDirectSource: boolean;
    hasMultipleSources: boolean;
    isAiVerified: boolean;
    isRecent: boolean;
  };
}

/**
 * Audit log entry
 * Records all significant actions in the system
 */
export interface AuditLog {
  /** Unique log ID */
  id: string;
  
  /** Action type */
  action: 
    | 'job_created'
    | 'job_started'
    | 'job_completed'
    | 'job_failed'
    | 'data_fetched'
    | 'data_parsed'
    | 'data_validated'
    | 'diff_computed'
    | 'ai_verified'
    | 'data_published'
    | 'data_rejected'
    | 'manual_review';
  
  /** Entity type */
  entityType: 'job' | 'program' | 'university' | 'diff';
  
  /** Entity ID */
  entityId: string;
  
  /** User/system that performed the action */
  actor: 'system' | 'user' | 'ai';
  actorId?: string;
  
  /** Action details */
  details: Record<string, any>;
  
  /** Timestamp */
  timestamp: string;
  
  /** Severity level */
  severity: 'info' | 'warning' | 'error' | 'critical';
}


