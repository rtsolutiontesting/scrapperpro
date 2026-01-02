/**
 * AI VERIFICATION LAYER
 * 
 * CRITICAL: AI is used ONLY for secondary verification, NOT as primary source.
 * 
 * Responsibilities:
 * - Double-check ambiguous fields
 * - Resolve conflicting values
 * - Assign confidence scores
 * - Flag fields that need manual review
 * 
 * AI NEVER writes final data directly.
 * AI is an assistant, not an authority.
 */

import { Program, ProgramDiff, FieldDiff, ConfidenceScore, FieldWithSource, SourceMeta } from '../types/core.js';
import { Config } from '../config.js';
import { Logger } from '../utils/logger.js';

export interface AIVerificationResult {
  /** Programs with AI-verified fields */
  programs: Program[];
  /** Updated confidence scores */
  confidenceScores: Map<string, ConfidenceScore>;
  /** Fields that still need manual review */
  requiresManualReview: Array<{ programId: string; fieldName: string; reason: string }>;
}

/**
 * AIVerifier class
 * Uses AI to verify ambiguous or conflicting data
 */
export class AIVerifier {
  private config: Config;
  private logger: Logger;
  private aiClient: any; // Will be initialized with Gemini API
  
  constructor(config: Config, logger: Logger) {
    this.config = config;
    this.logger = logger;
    
    // Initialize AI client if enabled
    if (config.ai.enabled && config.ai.apiKey) {
      // In production, initialize Gemini client here
      // For now, we'll implement a mock structure
      this.aiClient = null; // Would be: new GoogleGenAI({ apiKey: config.ai.apiKey });
    }
  }
  
  /**
   * Check if AI verification is enabled and available
   */
  private isEnabled(): boolean {
    return this.config.ai.enabled && !!this.config.ai.apiKey && !!this.aiClient;
  }
  
  /**
   * Verify a single field using AI
   * Returns updated confidence score and verified value (if changed)
   */
  private async verifyField(
    program: Program,
    fieldName: string,
    fieldValue: FieldWithSource<any>,
    context: string // Additional context (e.g., original HTML snippet)
  ): Promise<{ confidence: number; verifiedValue?: any; needsReview: boolean }> {
    if (!this.isEnabled()) {
      // AI not enabled - return original confidence
      return {
        confidence: fieldValue.source.confidenceScore,
        needsReview: fieldValue.source.confidenceScore < this.config.ai.aiVerificationThreshold,
      };
    }
    
    try {
      // Build prompt for AI verification
      // AI should only VERIFY, not generate new data
      const prompt = `
You are a data verification assistant. Your task is to VERIFY existing data, not generate new data.

Program: ${program.programName.value}
University: ${program.universityName.value}
Field: ${fieldName}
Value to verify: ${fieldValue.value}
Source context: ${context.substring(0, 500)}

Instructions:
1. Check if the value makes sense for this field
2. If the value seems incorrect or ambiguous, return your assessment
3. DO NOT generate a new value - only verify the existing one
4. Return a confidence score (0-100) for the value

Response format (JSON):
{
  "confidence": 0-100,
  "isValid": true/false,
  "needsReview": true/false,
  "notes": "Brief explanation"
}
      `;
      
      // Call AI API (mock implementation)
      // In production, use: await this.aiClient.models.generateContent(...)
      this.logger.debug(`AI verification requested for field`, {
        programId: program.id,
        fieldName,
        currentConfidence: fieldValue.source.confidenceScore,
      });
      
      // MOCK: In production, this would call the actual AI API
      // For now, we'll just log and return a conservative confidence score
      const mockResponse = {
        confidence: Math.min(fieldValue.source.confidenceScore + 10, 95), // Slight boost
        isValid: true,
        needsReview: fieldValue.source.confidenceScore < this.config.ai.aiVerificationThreshold,
        notes: 'AI verification not fully implemented - using conservative confidence',
      };
      
      this.logger.info(`AI verification completed`, {
        programId: program.id,
        fieldName,
        originalConfidence: fieldValue.source.confidenceScore,
        newConfidence: mockResponse.confidence,
        needsReview: mockResponse.needsReview,
      });
      
      return {
        confidence: mockResponse.confidence,
        needsReview: mockResponse.needsReview,
      };
      
    } catch (error: any) {
      this.logger.error(`AI verification failed`, error, {
        programId: program.id,
        fieldName,
      });
      
      // On error, return original confidence (conservative)
      return {
        confidence: fieldValue.source.confidenceScore,
        needsReview: true, // If AI fails, flag for review
      };
    }
  }
  
  /**
   * Verify ambiguous or low-confidence fields in a program
   */
  private async verifyProgram(program: Program, diffs?: ProgramDiff): Promise<Program> {
    if (!this.isEnabled()) {
      return program;
    }
    
    // Create a copy to avoid mutating original
    const verifiedProgram: Program = JSON.parse(JSON.stringify(program));
    
    // Fields that might need AI verification
    const fieldsToCheck: Array<keyof Program> = [
      'tuitionFee',
      'applicationFee',
      'ieltsScore',
      'toeflScore',
      'indianAcademicReq',
      'backlogPolicy',
      'indianScholarships',
    ];
    
    // Check fields that have low confidence or are in diffs
    for (const fieldName of fieldsToCheck) {
      const field = verifiedProgram[fieldName] as FieldWithSource<any> | undefined;
      
      if (!field) continue;
      
      // Verify if:
      // 1. Confidence is below threshold
      // 2. Field is in diffs (changed)
      // 3. Field was inferred (not directly extracted)
      const needsVerification =
        field.source.confidenceScore < this.config.ai.aiVerificationThreshold ||
        field.source.verificationMethod === 'inferred' ||
        (diffs && diffs.fieldDiffs.some(d => d.fieldName === fieldName));
      
      if (needsVerification) {
        // Get context (for now, just use field name)
        const context = `Field: ${fieldName}, Value: ${field.value}`;
        
        const verification = await this.verifyField(verifiedProgram, fieldName, field, context);
        
        // Update confidence score
        field.source.confidenceScore = verification.confidence;
        field.source.verificationMethod = 'ai_verified';
      }
    }
    
    return verifiedProgram;
  }
  
  /**
   * Verify programs and update confidence scores
   */
  async verify(programs: Program[], diffs?: ProgramDiff[]): Promise<AIVerificationResult> {
    if (!this.isEnabled()) {
      this.logger.warn('AI verification is disabled');
      return {
        programs,
        confidenceScores: new Map(),
        requiresManualReview: [],
      };
    }
    
    const verifiedPrograms: Program[] = [];
    const confidenceScores = new Map<string, ConfidenceScore>();
    const requiresManualReview: Array<{ programId: string; fieldName: string; reason: string }> = [];
    
    // Create diff map for efficient lookup
    const diffMap = new Map<string, ProgramDiff>();
    if (diffs) {
      for (const diff of diffs) {
        diffMap.set(diff.programId, diff);
      }
    }
    
    for (const program of programs) {
      const diff = diffMap.get(program.id);
      const verified = await this.verifyProgram(program, diff);
      verifiedPrograms.push(verified);
      
      // Calculate overall confidence score
      const fields = [
        verified.tuitionFee,
        verified.applicationFee,
        verified.ieltsScore,
        verified.toeflScore,
        verified.indianAcademicReq,
        verified.backlogPolicy,
      ].filter(f => f !== undefined) as FieldWithSource<any>[];
      
      if (fields.length > 0) {
        const avgConfidence = fields.reduce((sum, f) => sum + f.source.confidenceScore, 0) / fields.length;
        
        const confidenceScore: ConfidenceScore = {
          overall: avgConfidence,
          byCategory: {
            financial: this.getAvgConfidence([verified.tuitionFee, verified.applicationFee]),
            requirements: this.getAvgConfidence([verified.indianAcademicReq, verified.admissionRequirements]),
            deadlines: 90, // Deadlines typically high confidence
            scholarships: this.getAvgConfidence([verified.indianScholarships]),
          },
          factors: {
            hasDirectSource: fields.some(f => f.source.verificationMethod === 'direct'),
            hasMultipleSources: false, // Would need to track multiple sources
            isAiVerified: fields.some(f => f.source.verificationMethod === 'ai_verified'),
            isRecent: true, // Assume recent if just fetched
          },
        };
        
        confidenceScores.set(program.id, confidenceScore);
        
        // Check if manual review is needed
        if (avgConfidence < this.config.ai.aiVerificationThreshold) {
          requiresManualReview.push({
            programId: program.id,
            fieldName: 'overall',
            reason: `Low confidence score: ${avgConfidence.toFixed(1)}%`,
          });
        }
      }
    }
    
    this.logger.info(`AI verification complete`, {
      programsVerified: verifiedPrograms.length,
      requiresManualReview: requiresManualReview.length,
    });
    
    return {
      programs: verifiedPrograms,
      confidenceScores,
      requiresManualReview,
    };
  }
  
  /**
   * Get average confidence from fields
   */
  private getAvgConfidence(fields: Array<FieldWithSource<any> | undefined>): number {
    const validFields = fields.filter(f => f !== undefined) as FieldWithSource<any>[];
    if (validFields.length === 0) return 0;
    return validFields.reduce((sum, f) => sum + f.source.confidenceScore, 0) / validFields.length;
  }
}

