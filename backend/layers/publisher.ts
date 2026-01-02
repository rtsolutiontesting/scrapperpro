/**
 * PUBLISHER LAYER
 * 
 * Writes verified and approved data to Firebase Firestore.
 * 
 * Responsibilities:
 * - Batch writes for efficiency
 * - Maintain version history
 * - Only publish approved data
 * - Update timestamps and metadata
 * 
 * This is the final layer - only verified data reaches here.
 */

import { Program, AuditLog } from '../types/core.js';
import { Config } from '../config.js';
import { Logger } from '../utils/logger.js';

// Firestore types (would import from firebase-admin in production)
export interface FirestoreDb {
  collection(path: string): FirestoreCollection;
  batch(): FirestoreWriteBatch;
}

export interface FirestoreCollection {
  doc(id: string): FirestoreDocument;
  add(data: any): Promise<FirestoreDocument>;
}

export interface FirestoreDocument {
  id: string;
  set(data: any, options?: { merge?: boolean }): Promise<void>;
  update(data: any): Promise<void>;
  get(): Promise<FirestoreSnapshot>;
}

export interface FirestoreSnapshot {
  exists: boolean;
  data(): any;
}

export interface FirestoreWriteBatch {
  set(doc: FirestoreDocument, data: any, options?: { merge?: boolean }): void;
  update(doc: FirestoreDocument, data: any): void;
  delete(doc: FirestoreDocument): void;
  commit(): Promise<void>;
}

export interface PublishOptions {
  /** Whether to create version history */
  createVersionHistory: boolean;
  /** Whether to update audit log */
  updateAuditLog: boolean;
  /** User/system that approved the publish */
  approvedBy: string;
}

/**
 * Publisher class
 * Handles publishing to Firestore
 */
export class Publisher {
  private config: Config;
  private logger: Logger;
  private db: FirestoreDb | null; // Will be initialized with Firestore instance
  
  constructor(config: Config, logger: Logger, db?: FirestoreDb) {
    this.config = config;
    this.logger = logger;
    this.db = db || null;
  }
  
  /**
   * Convert Program to Firestore document format
   */
  private programToFirestore(program: Program): any {
    // Convert FieldWithSource to plain objects for Firestore
    const firestoreDoc: any = {
      id: program.id,
      universityName: program.universityName.value,
      universityName_source: program.universityName.source,
      programName: program.programName.value,
      programName_source: program.programName.source,
      level: program.level,
      country: program.country,
      createdAt: program.createdAt,
      updatedAt: program.updatedAt,
      lastVerifiedAt: program.lastVerifiedAt || program.updatedAt,
    };
    
    // Add optional fields if present
    if (program.tuitionFee) {
      firestoreDoc.tuitionFee = program.tuitionFee.value;
      firestoreDoc.tuitionFee_source = program.tuitionFee.source;
    }
    
    if (program.applicationFee) {
      firestoreDoc.applicationFee = program.applicationFee.value;
      firestoreDoc.applicationFee_source = program.applicationFee.source;
    }
    
    if (program.ieltsScore) {
      firestoreDoc.ieltsScore = program.ieltsScore.value;
      firestoreDoc.ieltsScore_source = program.ieltsScore.source;
    }
    
    if (program.toeflScore) {
      firestoreDoc.toeflScore = program.toeflScore.value;
      firestoreDoc.toeflScore_source = program.toeflScore.source;
    }
    
    if (program.admissionRequirements) {
      firestoreDoc.admissionRequirements = program.admissionRequirements.value;
      firestoreDoc.admissionRequirements_source = program.admissionRequirements.source;
    }
    
    if (program.indianAcademicReq) {
      firestoreDoc.indianAcademicReq = program.indianAcademicReq.value;
      firestoreDoc.indianAcademicReq_source = program.indianAcademicReq.source;
    }
    
    if (program.backlogPolicy) {
      firestoreDoc.backlogPolicy = program.backlogPolicy.value;
      firestoreDoc.backlogPolicy_source = program.backlogPolicy.source;
    }
    
    if (program.indianScholarships) {
      firestoreDoc.indianScholarships = program.indianScholarships.value;
      firestoreDoc.indianScholarships_source = program.indianScholarships.source;
    }
    
    if (program.languageWaiver) {
      firestoreDoc.languageWaiver = program.languageWaiver.value;
      firestoreDoc.languageWaiver_source = program.languageWaiver.source;
    }
    
    // Add intakes
    firestoreDoc.intakes = program.intakes.map(intake => ({
      term: intake.term,
      year: intake.year,
      isActive: intake.isActive.value,
      isActive_source: intake.isActive.source,
      deadlines: intake.deadlines.map(deadline => ({
        date: deadline.date.value,
        date_source: deadline.date.source,
        type: deadline.type,
        notes: deadline.notes,
      })),
    }));
    
    return firestoreDoc;
  }
  
  /**
   * Create version history entry
   */
  private async createVersionHistory(program: Program, versionNumber: number): Promise<void> {
    if (!this.db) {
      this.logger.warn('Firestore not initialized, skipping version history');
      return;
    }
    
    try {
      const versionDoc = {
        programId: program.id,
        version: versionNumber,
        data: this.programToFirestore(program),
        createdAt: new Date().toISOString(),
      };
      
      await this.db.collection('program_versions').add(versionDoc);
      
      this.logger.debug(`Created version history`, {
        programId: program.id,
        version: versionNumber,
      });
    } catch (error: any) {
      this.logger.error(`Failed to create version history`, error, {
        programId: program.id,
        version: versionNumber,
      });
      // Don't throw - version history is not critical
    }
  }
  
  /**
   * Create audit log entry
   */
  private async createAuditLog(program: Program, action: AuditLog['action'], approvedBy: string): Promise<void> {
    if (!this.db) {
      this.logger.warn('Firestore not initialized, skipping audit log');
      return;
    }
    
    try {
      const auditEntry: AuditLog = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        action,
        entityType: 'program',
        entityId: program.id,
        actor: approvedBy === 'system' ? 'system' : 'user',
        actorId: approvedBy,
        details: {
          programName: program.programName.value,
          universityName: program.universityName.value,
        },
        timestamp: new Date().toISOString(),
        severity: 'info',
      };
      
      await this.db.collection('audit_logs').add(auditEntry);
      
      this.logger.debug(`Created audit log`, {
        programId: program.id,
        action,
      });
    } catch (error: any) {
      this.logger.error(`Failed to create audit log`, error, {
        programId: program.id,
        action,
      });
      // Don't throw - audit log is not critical
    }
  }
  
  /**
   * Get current version number for a program
   */
  private async getCurrentVersion(programId: string): Promise<number> {
    if (!this.db) return 1;
    
    try {
      // In production, query Firestore for latest version
      // For now, return 1
      return 1;
    } catch (error: any) {
      this.logger.warn(`Failed to get current version`, { programId, error: error.message });
      return 1;
    }
  }
  
  /**
   * Publish a single program
   */
  async publishProgram(program: Program, options: PublishOptions): Promise<void> {
    if (!this.db) {
      throw new Error('Firestore not initialized');
    }
    
    try {
      const programRef = this.db.collection('university_programs').doc(program.id);
      
      // Get current version
      const currentVersion = await this.getCurrentVersion(program.id);
      const nextVersion = currentVersion + 1;
      
      // Convert to Firestore format
      const firestoreDoc = this.programToFirestore(program);
      firestoreDoc.version = nextVersion;
      firestoreDoc.publishedAt = new Date().toISOString();
      firestoreDoc.publishedBy = options.approvedBy;
      
      // Write to Firestore (merge to preserve ID)
      await programRef.set(firestoreDoc, { merge: true });
      
      // Create version history if requested
      if (options.createVersionHistory) {
        await this.createVersionHistory(program, nextVersion);
      }
      
      // Create audit log if requested
      if (options.updateAuditLog) {
        await this.createAuditLog(program, 'data_published', options.approvedBy);
      }
      
      this.logger.info(`Published program`, {
        programId: program.id,
        programName: program.programName.value,
        version: nextVersion,
        approvedBy: options.approvedBy,
      });
      
    } catch (error: any) {
      this.logger.error(`Failed to publish program`, error, {
        programId: program.id,
        programName: program.programName.value,
      });
      throw error;
    }
  }
  
  /**
   * Publish multiple programs in batch
   * 
   * Uses Firestore batch writes for efficiency
   */
  async publishPrograms(programs: Program[], options: PublishOptions): Promise<void> {
    if (!this.db) {
      throw new Error('Firestore not initialized');
    }
    
    const startTime = Date.now();
    
    try {
      // Firestore batch limit is 500 operations
      const BATCH_SIZE = 500;
      
      for (let i = 0; i < programs.length; i += BATCH_SIZE) {
        const batch = this.db.batch();
        const batchPrograms = programs.slice(i, i + BATCH_SIZE);
        
        for (const program of batchPrograms) {
          const programRef = this.db.collection('university_programs').doc(program.id);
          const firestoreDoc = this.programToFirestore(program);
          firestoreDoc.version = await this.getCurrentVersion(program.id) + 1;
          firestoreDoc.publishedAt = new Date().toISOString();
          firestoreDoc.publishedBy = options.approvedBy;
          
          batch.set(programRef, firestoreDoc, { merge: true });
        }
        
        // Commit batch
        await batch.commit();
        
        this.logger.info(`Published batch`, {
          batchStart: i,
          batchSize: batchPrograms.length,
          totalPrograms: programs.length,
        });
        
        // Create version history and audit logs (async, don't block)
        if (options.createVersionHistory || options.updateAuditLog) {
          for (const program of batchPrograms) {
            if (options.createVersionHistory) {
              this.createVersionHistory(program, await this.getCurrentVersion(program.id) + 1).catch(err => {
                this.logger.warn(`Failed to create version history (non-blocking)`, { programId: program.id, error: err.message });
              });
            }
            
            if (options.updateAuditLog) {
              this.createAuditLog(program, 'data_published', options.approvedBy).catch(err => {
                this.logger.warn(`Failed to create audit log (non-blocking)`, { programId: program.id, error: err.message });
              });
            }
          }
        }
      }
      
      const duration = Date.now() - startTime;
      
      this.logger.info(`Published all programs`, {
        totalPrograms: programs.length,
        duration,
        approvedBy: options.approvedBy,
      });
      
    } catch (error: any) {
      this.logger.error(`Failed to publish programs`, error, {
        totalPrograms: programs.length,
        duration: Date.now() - startTime,
      });
      throw error;
    }
  }
}

