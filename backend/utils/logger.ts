/**
 * STRUCTURED LOGGING
 * 
 * Provides structured, queryable logging for observability.
 * All logs include context for tracing and debugging.
 */

import { Config } from '../config.js';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface LogContext {
  jobId?: string;
  universityId?: string;
  programId?: string;
  url?: string;
  duration?: number; // milliseconds
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
}

export class Logger {
  private config: Config;
  private logs: LogEntry[] = []; // In-memory buffer (in production, send to Cloud Logging)
  
  constructor(config: Config) {
    this.config = config;
  }
  
  /**
   * Get a random User-Agent string
   */
  private getRandomUserAgent(): string {
    const agents = this.config.fetch.userAgents;
    return agents[Math.floor(Math.random() * agents.length)];
  }
  
  /**
   * Log an entry
   */
  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };
    
    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
      };
    }
    
    // Add to buffer
    this.logs.push(entry);
    
    // Keep only last 1000 logs in memory
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
    
    // Console output (structured if enabled)
    if (this.config.logging.structured) {
      console.log(JSON.stringify(entry));
    } else {
      const prefix = `[${level.toUpperCase()}]`;
      console[level === 'error' || level === 'critical' ? 'error' : 'log'](
        prefix,
        message,
        context ? JSON.stringify(context, null, 2) : '',
        error ? error.stack : ''
      );
    }
    
    // In production, also send to Cloud Logging
    // This would integrate with @google-cloud/logging
  }
  
  debug(message: string, context?: LogContext): void {
    if (this.config.logging.level === 'debug') {
      this.log('debug', message, context);
    }
  }
  
  info(message: string, context?: LogContext): void {
    if (['debug', 'info'].includes(this.config.logging.level)) {
      this.log('info', message, context);
    }
  }
  
  warn(message: string, context?: LogContext): void {
    if (['debug', 'info', 'warn'].includes(this.config.logging.level)) {
      this.log('warn', message, context);
    }
  }
  
  error(message: string, error?: Error, context?: LogContext): void {
    this.log('error', message, context, error);
  }
  
  critical(message: string, error?: Error, context?: LogContext): void {
    this.log('critical', message, context, error);
  }
  
  /**
   * Get recent logs (for debugging/observability)
   */
  getRecentLogs(limit: number = 100): LogEntry[] {
    return this.logs.slice(-limit);
  }
  
  /**
   * Get logs filtered by context
   */
  getLogsByContext(filter: Partial<LogContext>, limit: number = 100): LogEntry[] {
    return this.logs
      .filter(log => {
        if (!log.context) return false;
        return Object.keys(filter).every(key => log.context![key] === filter[key]);
      })
      .slice(-limit);
  }
}

// Singleton instance
let loggerInstance: Logger | null = null;

export function getLogger(config: Config): Logger {
  if (!loggerInstance) {
    loggerInstance = new Logger(config);
  }
  return loggerInstance;
}

export function createLogger(config: Config): Logger {
  return new Logger(config);
}

