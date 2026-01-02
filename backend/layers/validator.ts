/**
 * VALIDATOR LAYER
 * 
 * Ensures data format correctness and consistency.
 * 
 * Responsibilities:
 * - Date sanity checks
 * - Format validation (currency, scores, percentages)
 * - Cross-field consistency checks
 * - Data type validation
 * 
 * Does NOT verify accuracy (that's AI Verification layer)
 * Does NOT fetch data (that's Fetcher layer)
 */

import { Program, Intake, Deadline } from '../types/core.js';
import { Logger } from '../utils/logger.js';

export interface ValidationResult {
  /** Programs that passed validation */
  valid: Program[];
  /** Programs that failed validation with errors */
  invalid: Array<{ program: Program; errors: string[] }>;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Validator class
 * Validates program data for format and consistency
 */
export class Validator {
  private logger: Logger;
  
  constructor(logger: Logger) {
    this.logger = logger;
  }
  
  /**
   * Validate a date string
   * Returns true if valid, false otherwise
   */
  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && dateString.length >= 10; // At least YYYY-MM-DD
  }
  
  /**
   * Validate a currency string (basic check)
   */
  private isValidCurrency(value: string): boolean {
    // Should contain digits and currency symbols
    return /[\d,]+/.test(value) && value.length < 100; // Reasonable length limit
  }
  
  /**
   * Validate an IELTS score (0-9 range)
   */
  private isValidIELTS(value: string): boolean {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && num <= 9;
  }
  
  /**
   * Validate a TOEFL score (0-120 range)
   */
  private isValidTOEFL(value: string): boolean {
    const num = parseInt(value, 10);
    return !isNaN(num) && num >= 0 && num <= 120;
  }
  
  /**
   * Validate a percentage string
   */
  private isValidPercentage(value: string): boolean {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && num <= 100;
  }
  
  /**
   * Validate deadlines for an intake
   */
  private validateIntake(intake: Intake): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // Validate year (should be current year or future)
    const currentYear = new Date().getFullYear();
    if (intake.year < currentYear - 1 || intake.year > currentYear + 5) {
      errors.push({
        field: 'intake.year',
        message: `Year ${intake.year} seems invalid (expected ${currentYear - 1} to ${currentYear + 5})`,
        severity: 'warning',
      });
    }
    
    // Validate deadlines
    for (const deadline of intake.deadlines) {
      if (!this.isValidDate(deadline.date.value)) {
        errors.push({
          field: 'deadline.date',
          message: `Invalid date format: ${deadline.date.value}`,
          severity: 'error',
        });
      } else {
        // Check if deadline is in the past (might be ok for historical data)
        const deadlineDate = new Date(deadline.date.value);
        const now = new Date();
        if (deadlineDate < now) {
          errors.push({
            field: 'deadline.date',
            message: `Deadline ${deadline.date.value} is in the past`,
            severity: 'warning',
          });
        }
      }
    }
    
    return errors;
  }
  
  /**
   * Validate cross-field consistency
   */
  private validateConsistency(program: Program): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // If both IELTS and TOEFL are provided, they should be consistent (not contradictory)
    if (program.ieltsScore && program.toeflScore) {
      // Basic check: both should be reasonable
      const ieltsNum = parseFloat(program.ieltsScore.value);
      const toeflNum = parseInt(program.toeflScore.value, 10);
      
      // Rough conversion: IELTS 6.5 ≈ TOEFL 79-93, IELTS 7.0 ≈ TOEFL 94-101
      // This is just a sanity check, not strict validation
      if (!isNaN(ieltsNum) && !isNaN(toeflNum)) {
        const expectedToeflMin = (ieltsNum - 5) * 30 + 35; // Rough formula
        const expectedToeflMax = (ieltsNum - 4) * 30 + 45;
        
        if (toeflNum < expectedToeflMin - 20 || toeflNum > expectedToeflMax + 20) {
          errors.push({
            field: 'language_scores',
            message: `IELTS ${ieltsNum} and TOEFL ${toeflNum} seem inconsistent`,
            severity: 'warning',
          });
        }
      }
    }
    
    // Check that tuition fee is typically higher than application fee
    if (program.tuitionFee && program.applicationFee) {
      const tuitionMatch = program.tuitionFee.value.match(/[\d,]+/);
      const appFeeMatch = program.applicationFee.value.match(/[\d,]+/);
      
      if (tuitionMatch && appFeeMatch) {
        const tuitionNum = parseInt(tuitionMatch[0].replace(/,/g, ''), 10);
        const appFeeNum = parseInt(appFeeMatch[0].replace(/,/g, ''), 10);
        
        if (!isNaN(tuitionNum) && !isNaN(appFeeNum) && appFeeNum > tuitionNum * 0.1) {
          errors.push({
            field: 'fees',
            message: `Application fee (${appFeeNum}) seems unusually high compared to tuition (${tuitionNum})`,
            severity: 'warning',
          });
        }
      }
    }
    
    return errors;
  }
  
  /**
   * Validate a single program
   */
  private validateProgram(program: Program): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // Validate required fields
    if (!program.id || program.id.trim().length === 0) {
      errors.push({
        field: 'id',
        message: 'Program ID is required',
        severity: 'error',
      });
    }
    
    if (!program.universityName || !program.universityName.value) {
      errors.push({
        field: 'universityName',
        message: 'University name is required',
        severity: 'error',
      });
    }
    
    if (!program.programName || !program.programName.value) {
      errors.push({
        field: 'programName',
        message: 'Program name is required',
        severity: 'error',
      });
    }
    
    // Validate optional fields (only if present)
    if (program.tuitionFee && !this.isValidCurrency(program.tuitionFee.value)) {
      errors.push({
        field: 'tuitionFee',
        message: `Invalid currency format: ${program.tuitionFee.value}`,
        severity: 'error',
      });
    }
    
    if (program.applicationFee && !this.isValidCurrency(program.applicationFee.value)) {
      errors.push({
        field: 'applicationFee',
        message: `Invalid currency format: ${program.applicationFee.value}`,
        severity: 'error',
      });
    }
    
    if (program.ieltsScore && !this.isValidIELTS(program.ieltsScore.value)) {
      errors.push({
        field: 'ieltsScore',
        message: `Invalid IELTS score: ${program.ieltsScore.value} (expected 0-9)`,
        severity: 'error',
      });
    }
    
    if (program.toeflScore && !this.isValidTOEFL(program.toeflScore.value)) {
      errors.push({
        field: 'toeflScore',
        message: `Invalid TOEFL score: ${program.toeflScore.value} (expected 0-120)`,
        severity: 'error',
      });
    }
    
    // Validate intakes
    for (const intake of program.intakes) {
      const intakeErrors = this.validateIntake(intake);
      errors.push(...intakeErrors);
    }
    
    // Cross-field consistency checks
    const consistencyErrors = this.validateConsistency(program);
    errors.push(...consistencyErrors);
    
    return errors;
  }
  
  /**
   * Validate multiple programs
   */
  async validate(programs: Program[]): Promise<ValidationResult> {
    const valid: Program[] = [];
    const invalid: Array<{ program: Program; errors: string[] }> = [];
    
    for (const program of programs) {
      const errors = this.validateProgram(program);
      
      // Separate errors and warnings
      const fatalErrors = errors.filter(e => e.severity === 'error');
      const warnings = errors.filter(e => e.severity === 'warning');
      
      if (fatalErrors.length > 0) {
        // Has fatal errors - mark as invalid
        invalid.push({
          program,
          errors: fatalErrors.map(e => `${e.field}: ${e.message}`),
        });
        
        this.logger.warn(`Program validation failed`, {
          programId: program.id,
          programName: program.programName?.value,
          errors: fatalErrors.map(e => e.message),
        });
      } else {
        // Only warnings or no errors - mark as valid
        valid.push(program);
        
        if (warnings.length > 0) {
          this.logger.debug(`Program validation passed with warnings`, {
            programId: program.id,
            programName: program.programName?.value,
            warnings: warnings.map(e => e.message),
          });
        }
      }
    }
    
    this.logger.info(`Validation complete`, {
      total: programs.length,
      valid: valid.length,
      invalid: invalid.length,
    });
    
    return {
      valid,
      invalid,
    };
  }
}

