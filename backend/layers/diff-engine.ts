/**
 * DIFF ENGINE
 * 
 * Compares previous stored data with newly fetched data.
 * 
 * Responsibilities:
 * - Field-by-field comparison
 * - Detect changes (unchanged, changed, missing, newly added)
 * - Generate diff results with confidence scores
 * - Flag changes that require manual review
 * 
 * Does NOT modify data - only compares and reports differences
 */

import { Program, ProgramDiff, FieldDiff, FieldChangeType, SourceMeta, FieldWithSource } from '../types/core.js';
import { Logger } from '../utils/logger.js';

export interface DiffOptions {
  /** Threshold for confidence score to require review */
  reviewThreshold: number;
  /** Whether to consider source changes as data changes */
  considerSourceChanges: boolean;
}

/**
 * DiffEngine class
 * Compares programs and generates diffs
 */
export class DiffEngine {
  private logger: Logger;
  private defaultOptions: DiffOptions;
  
  constructor(logger: Logger, options: Partial<DiffOptions> = {}) {
    this.logger = logger;
    this.defaultOptions = {
      reviewThreshold: 70, // Changes below 70% confidence need review
      considerSourceChanges: false, // Source changes don't count as data changes
      ...options,
    };
  }
  
  /**
   * Compare two values (deep comparison)
   */
  private valuesEqual(value1: any, value2: any): boolean {
    if (value1 === value2) return true;
    if (value1 == null || value2 == null) return false;
    if (typeof value1 !== typeof value2) return false;
    
    // For objects, do shallow comparison
    if (typeof value1 === 'object') {
      const keys1 = Object.keys(value1);
      const keys2 = Object.keys(value2);
      if (keys1.length !== keys2.length) return false;
      
      for (const key of keys1) {
        if (value1[key] !== value2[key]) return false;
      }
      return true;
    }
    
    return false;
  }
  
  /**
   * Compare two FieldWithSource values
   */
  private compareFields(
    previous: FieldWithSource<any> | undefined,
    current: FieldWithSource<any> | undefined,
    fieldName: string
  ): FieldDiff | null {
    // Both missing - no change
    if (!previous && !current) {
      return null;
    }
    
    // Newly added
    if (!previous && current) {
      return {
        fieldName,
        changeType: 'newly_added',
        newValue: current.value,
        newSource: current.source,
        confidenceScore: current.source.confidenceScore,
        requiresReview: current.source.confidenceScore < this.defaultOptions.reviewThreshold,
      };
    }
    
    // Missing (removed)
    if (previous && !current) {
      return {
        fieldName,
        changeType: 'missing',
        previousValue: previous.value,
        previousSource: previous.source,
        confidenceScore: previous.source.confidenceScore, // Use previous confidence
        requiresReview: true, // Always review missing data
      };
    }
    
    // Both present - compare values
    if (previous && current) {
      const valuesEqual = this.valuesEqual(previous.value, current.value);
      
      if (valuesEqual && !this.defaultOptions.considerSourceChanges) {
        // Values are the same, and we don't care about source changes
        return {
          fieldName,
          changeType: 'unchanged',
          previousValue: previous.value,
          previousSource: previous.source,
          newValue: current.value,
          newSource: current.source,
          confidenceScore: Math.max(previous.source.confidenceScore, current.source.confidenceScore),
          requiresReview: false,
        };
      }
      
      if (valuesEqual && this.defaultOptions.considerSourceChanges) {
        // Values are same but source changed - still unchanged
        return {
          fieldName,
          changeType: 'unchanged',
          previousValue: previous.value,
          previousSource: previous.source,
          newValue: current.value,
          newSource: current.source,
          confidenceScore: Math.max(previous.source.confidenceScore, current.source.confidenceScore),
          requiresReview: false,
        };
      }
      
      // Values are different - changed
      const avgConfidence = (previous.source.confidenceScore + current.source.confidenceScore) / 2;
      return {
        fieldName,
        changeType: 'changed',
        previousValue: previous.value,
        previousSource: previous.source,
        newValue: current.value,
        newSource: current.source,
        confidenceScore: avgConfidence,
        requiresReview: avgConfidence < this.defaultOptions.reviewThreshold || this.isSignificantChange(fieldName, previous.value, current.value),
      };
    }
    
    return null;
  }
  
  /**
   * Determine if a change is significant (requires review)
   */
  private isSignificantChange(fieldName: string, oldValue: any, newValue: any): boolean {
    // Financial fields - large changes need review
    if (fieldName === 'tuitionFee' || fieldName === 'applicationFee') {
      const oldNum = this.extractNumber(oldValue);
      const newNum = this.extractNumber(newValue);
      if (oldNum && newNum) {
        const percentChange = Math.abs((newNum - oldNum) / oldNum) * 100;
        return percentChange > 20; // More than 20% change
      }
    }
    
    // Score fields - any change is significant
    if (fieldName === 'ieltsScore' || fieldName === 'toeflScore') {
      return true;
    }
    
    // Deadline changes are always significant
    if (fieldName.includes('deadline') || fieldName.includes('date')) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Extract number from a string (for financial fields)
   */
  private extractNumber(value: any): number | null {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const match = value.match(/[\d,]+/);
      if (match) {
        return parseInt(match[0].replace(/,/g, ''), 10);
      }
    }
    return null;
  }
  
  /**
   * Compare two programs
   */
  private comparePrograms(previous: Program | undefined, current: Program): ProgramDiff {
    const fieldDiffs: FieldDiff[] = [];
    
    // Compare each field
    const fieldsToCompare: Array<keyof Program> = [
      'universityName',
      'programName',
      'tuitionFee',
      'applicationFee',
      'ieltsScore',
      'toeflScore',
      'admissionRequirements',
      'indianAcademicReq',
      'backlogPolicy',
      'indianScholarships',
      'languageWaiver',
    ];
    
    for (const fieldName of fieldsToCompare) {
      const previousField = previous?.[fieldName] as FieldWithSource<any> | undefined;
      const currentField = current[fieldName] as FieldWithSource<any> | undefined;
      
      const diff = this.compareFields(previousField, currentField, fieldName);
      if (diff && diff.changeType !== 'unchanged') {
        fieldDiffs.push(diff);
      }
    }
    
    // Calculate overall confidence
    const confidenceScores = fieldDiffs.map(d => d.confidenceScore);
    const overallConfidence = confidenceScores.length > 0
      ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
      : 100;
    
    // Determine if review is required
    const requiresReview = fieldDiffs.some(d => d.requiresReview) || overallConfidence < this.defaultOptions.reviewThreshold;
    
    return {
      programId: current.id,
      isNew: !previous,
      isDeleted: false, // Will be set by caller if program was removed
      fieldDiffs,
      overallConfidence,
      requiresReview,
    };
  }
  
  /**
   * Compare new programs with previous programs
   */
  async computeDiff(previousPrograms: Program[], currentPrograms: Program[]): Promise<ProgramDiff[]> {
    const diffs: ProgramDiff[] = [];
    
    // Create maps for efficient lookup
    const previousMap = new Map<string, Program>();
    for (const program of previousPrograms) {
      previousMap.set(program.id, program);
    }
    
    const currentMap = new Map<string, Program>();
    for (const program of currentPrograms) {
      currentMap.set(program.id, program);
    }
    
    // Compare programs that exist in both or are new
    for (const currentProgram of currentPrograms) {
      const previousProgram = previousMap.get(currentProgram.id);
      const diff = this.comparePrograms(previousProgram, currentProgram);
      diffs.push(diff);
    }
    
    // Find deleted programs (exist in previous but not in current)
    for (const previousProgram of previousPrograms) {
      if (!currentMap.has(previousProgram.id)) {
        diffs.push({
          programId: previousProgram.id,
          isNew: false,
          isDeleted: true,
          fieldDiffs: [],
          overallConfidence: 100, // We're confident it's deleted
          requiresReview: true, // Always review deletions
        });
      }
    }
    
    this.logger.info(`Diff computation complete`, {
      previousCount: previousPrograms.length,
      currentCount: currentPrograms.length,
      diffsCount: diffs.length,
      newPrograms: diffs.filter(d => d.isNew).length,
      deletedPrograms: diffs.filter(d => d.isDeleted).length,
      changedPrograms: diffs.filter(d => !d.isNew && !d.isDeleted && d.fieldDiffs.length > 0).length,
      requiresReview: diffs.filter(d => d.requiresReview).length,
    });
    
    return diffs;
  }
}

