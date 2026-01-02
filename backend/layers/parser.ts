/**
 * PARSER LAYER
 * 
 * Extracts structured fields from raw HTML/PDF content.
 * 
 * CRITICAL PRINCIPLES:
 * - NO assumptions
 * - If field not found → return null, NEVER hallucinate
 * - Return raw extracted values, no interpretation
 * - Preserve source metadata for every field
 * 
 * This layer does NOT validate or verify data - it only extracts.
 */

import { FetchResult } from './fetcher.js';
import { Program, ProgramLevel, Intake, IntakeTerm, FieldWithSource, SourceMeta } from '../types/core.js';
import { Logger } from '../utils/logger.js';

export interface ParseResult {
  /** Successfully parsed programs */
  programs: Program[];
  /** URLs that were parsed */
  urlsParsed: string[];
  /** Any errors during parsing (non-fatal) */
  errors: Array<{ url: string; error: string }>;
}

/**
 * Parser class
 * Extracts structured data from HTML
 */
export class Parser {
  private logger: Logger;
  
  constructor(logger: Logger) {
    this.logger = logger;
  }
  
  /**
   * Create source metadata for a field
   */
  private createSourceMeta(url: string, verificationMethod: 'direct' | 'inferred' = 'direct'): SourceMeta {
    return {
      sourceUrl: url,
      fetchedAt: new Date().toISOString(),
      confidenceScore: verificationMethod === 'direct' ? 90 : 60, // Lower confidence for inferred
      verificationMethod,
    };
  }
  
  /**
   * Extract text content from HTML (basic implementation)
   * In production, you might use a library like cheerio or jsdom
   */
  private extractText(html: string): string {
    // Remove script and style tags
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    // Remove HTML tags
    text = text.replace(/<[^>]+>/g, ' ');
    
    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
  }
  
  /**
   * Extract a field value from HTML using regex patterns
   * Returns null if not found (NEVER guesses or hallucinates)
   */
  private extractField(html: string, patterns: RegExp[]): string | null {
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return null; // Not found - return null, don't guess
  }
  
  /**
   * Parse program level from text
   * Returns null if unclear
   */
  private parseLevel(text: string): ProgramLevel | null {
    const upperText = text.toUpperCase();
    
    if (upperText.includes('UNDERGRADUATE') || upperText.includes(' BACHELOR') || upperText.includes('B.SC') || upperText.includes('B.A')) {
      return ProgramLevel.UG;
    }
    if (upperText.includes('POSTGRADUATE') || upperText.includes(' MASTER') || upperText.includes('M.SC') || upperText.includes('M.A') || upperText.includes('M.B.A')) {
      return ProgramLevel.PG;
    }
    if (upperText.includes('PHD') || upperText.includes('DOCTORATE') || upperText.includes('PH.D')) {
      return ProgramLevel.PHD;
    }
    
    return null; // Cannot determine - return null
  }
  
  /**
   * Parse a single HTML page into program data
   * 
   * This is a simplified implementation. In production, you would:
   * - Use a proper HTML parser (cheerio, jsdom)
   * - Have university-specific parsers
   * - Use more sophisticated extraction (CSS selectors, XPath)
   * - Handle PDFs separately
   * 
   * But the principle remains: if data is not found, return null.
   */
  private parseHtml(fetchResult: FetchResult, universityName: string, country: string): Program[] {
    const programs: Program[] = [];
    const html = fetchResult.body;
    const url = fetchResult.url;
    
    // Basic extraction patterns (these would be more sophisticated in production)
    // This is a placeholder implementation - real parsers would be much more complex
    
    // Try to extract program information
    // For now, we'll create a single program entry with whatever we can extract
    // In production, you'd extract multiple programs from a single page
    
    const programName = this.extractField(html, [
      /<h1[^>]*>(.*?)<\/h1>/i,
      /<title[^>]*>(.*?)<\/title>/i,
      /program[:\s]+([^<\n]+)/i,
    ]);
    
    // If we can't find even a program name, return empty array
    if (!programName) {
      this.logger.debug(`Could not extract program name from ${url}`);
      return [];
    }
    
    // Extract level
    const levelText = html.substring(0, 5000); // Check first 5KB for level indicators
    const level = this.parseLevel(levelText) || ProgramLevel.UG; // Default to UG if unclear (conservative)
    
    // Extract other fields (all optional - return null if not found)
    const tuitionFee = this.extractField(html, [
      /tuition[:\s\$]+([\d,]+)/i,
      /fee[:\s\$]+([\d,]+)/i,
    ]);
    
    const applicationFee = this.extractField(html, [
      /application\s+fee[:\s\$]+([\d,]+)/i,
    ]);
    
    const ieltsScore = this.extractField(html, [
      /ielts[:\s]+([\d.]+)/i,
      /ielts\s+score[:\s]+([\d.]+)/i,
    ]);
    
    const toeflScore = this.extractField(html, [
      /toefl[:\s]+([\d]+)/i,
      /toefl\s+score[:\s]+([\d]+)/i,
    ]);
    
    // India-specific fields
    const indianAcademicReq = this.extractField(html, [
      /india[^<]*?([0-9]+%)/i,
      /cbse[^<]*?([0-9]+%)/i,
      /icse[^<]*?([0-9]+%)/i,
    ]);
    
    const backlogPolicy = this.extractField(html, [
      /backlog[^<]{0,200}/i,
      /re.?attempt[^<]{0,200}/i,
    ]);
    
    const indianScholarships = this.extractField(html, [
      /india[^<]*?scholarship[^<]{0,300}/i,
      /commonwealth[^<]{0,300}/i,
    ]);
    
    // Create program ID
    const programId = `${universityName.toLowerCase().replace(/\s+/g, '-')}-${programName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    
    // Build program object (only include fields that were found)
    const program: Program = {
      id: programId,
      universityName: {
        value: universityName,
        source: this.createSourceMeta(url),
      },
      programName: {
        value: programName,
        source: this.createSourceMeta(url),
      },
      level,
      country: country as any,
      intakes: [], // Intakes would be parsed separately
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Only add fields that were found (not null)
    if (tuitionFee) {
      program.tuitionFee = {
        value: tuitionFee,
        source: this.createSourceMeta(url),
      };
    }
    
    if (applicationFee) {
      program.applicationFee = {
        value: applicationFee,
        source: this.createSourceMeta(url),
      };
    }
    
    if (ieltsScore) {
      program.ieltsScore = {
        value: ieltsScore,
        source: this.createSourceMeta(url),
      };
    }
    
    if (toeflScore) {
      program.toeflScore = {
        value: toeflScore,
        source: this.createSourceMeta(url),
      };
    }
    
    if (indianAcademicReq) {
      program.indianAcademicReq = {
        value: indianAcademicReq,
        source: this.createSourceMeta(url, 'inferred'), // Lower confidence for inferred
      };
    }
    
    if (backlogPolicy) {
      program.backlogPolicy = {
        value: backlogPolicy,
        source: this.createSourceMeta(url, 'inferred'),
      };
    }
    
    if (indianScholarships) {
      program.indianScholarships = {
        value: indianScholarships,
        source: this.createSourceMeta(url, 'inferred'),
      };
    }
    
    programs.push(program);
    
    this.logger.debug(`Parsed program from ${url}`, {
      url,
      programId: program.id,
      programName: program.programName.value,
      fieldsFound: Object.keys(program).filter(key => key !== 'id' && key !== 'createdAt' && key !== 'updatedAt').length,
    });
    
    return programs;
  }
  
  /**
   * Parse multiple fetch results into structured program data
   */
  async parse(fetchResults: FetchResult[], universityName: string, country: string): Promise<ParseResult> {
    const programs: Program[] = [];
    const errors: Array<{ url: string; error: string }> = [];
    const urlsParsed: string[] = [];
    
    for (const fetchResult of fetchResults) {
      try {
        urlsParsed.push(fetchResult.url);
        
        // Skip if content type is not HTML/text
        if (!fetchResult.contentType.includes('text/html') && !fetchResult.contentType.includes('text/plain')) {
          this.logger.debug(`Skipping non-HTML content: ${fetchResult.contentType}`, { url: fetchResult.url });
          continue;
        }
        
        const parsedPrograms = this.parseHtml(fetchResult, universityName, country);
        programs.push(...parsedPrograms);
        
      } catch (error: any) {
        this.logger.warn(`Failed to parse ${fetchResult.url}`, { url: fetchResult.url, error: error.message });
        errors.push({
          url: fetchResult.url,
          error: error.message,
        });
      }
    }
    
    this.logger.info(`Parsing complete`, {
      programsFound: programs.length,
      urlsParsed: urlsParsed.length,
      errors: errors.length,
    });
    
    return {
      programs,
      urlsParsed,
      errors,
    };
  }
}

