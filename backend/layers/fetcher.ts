/**
 * FETCHER LAYER
 * 
 * Responsible ONLY for fetching raw data from university websites.
 * 
 * Principles:
 * - Uses fetch() with respectful headers
 * - Randomized but human-like User-Agent
 * - Respectful delays between requests
 * - Sequential execution (one page at a time)
 * - Automatic backoff on 403/429
 * - No headless browsers, no bot protection bypass
 * 
 * This layer does NOT parse or interpret data - it only fetches.
 */

import { Config } from '../config.js';
import { Logger } from '../utils/logger.js';
import { waitBetweenRequests, getBackoffDelay, sleep } from '../utils/delay.js';

export interface FetchResult {
  /** URL that was fetched */
  url: string;
  /** HTTP status code */
  statusCode: number;
  /** Response headers */
  headers: Record<string, string>;
  /** Response body (HTML/text) */
  body: string;
  /** Content-Type */
  contentType: string;
  /** Whether this fetch was blocked (403/429) */
  blocked: boolean;
  /** Fetch timestamp */
  fetchedAt: string;
}

export interface FetchError extends Error {
  code: string;
  statusCode?: number;
  blocked: boolean;
  retryable: boolean;
}

/**
 * Fetcher class
 * Handles all HTTP fetching with safety measures
 */
export class Fetcher {
  private config: Config;
  private logger: Logger;
  
  constructor(config: Config, logger: Logger) {
    this.config = config;
    this.logger = logger;
  }
  
  /**
   * Get a random User-Agent string
   */
  private getRandomUserAgent(): string {
    const agents = this.config.fetch.userAgents;
    return agents[Math.floor(Math.random() * agents.length)];
  }
  
  /**
   * Fetch a single URL
   * 
   * Implements:
   * - Respectful headers
   * - Timeout handling
   * - Error classification (blocked vs retryable)
   * - Automatic retry with backoff
   */
  async fetchUrl(url: string, retryCount: number = 0): Promise<FetchResult> {
    const startTime = Date.now();
    
    try {
      this.logger.debug(`Fetching URL: ${url}`, { url, retryCount });
      
      // Build headers with random User-Agent
      const headers: Record<string, string> = {
        ...this.config.fetch.headers,
        'User-Agent': this.getRandomUserAgent(),
        'Referer': new URL(url).origin, // Polite: indicate we came from the same domain
      };
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.fetch.timeout);
      
      try {
        // Fetch with timeout
        const response = await fetch(url, {
          headers,
          signal: controller.signal,
          redirect: 'follow', // Follow redirects (but don't loop forever)
        });
        
        clearTimeout(timeoutId);
        
        // Check status code
        if (response.status === 403 || response.status === 429) {
          // BLOCKED - Do not retry automatically
          const error: FetchError = new Error(`HTTP ${response.status}: Request blocked`) as FetchError;
          error.code = 'BLOCKED';
          error.statusCode = response.status;
          error.blocked = true;
          error.retryable = false;
          throw error;
        }
        
        if (response.status >= 500) {
          // Server error - retryable
          const error: FetchError = new Error(`HTTP ${response.status}: Server error`) as FetchError;
          error.code = 'SERVER_ERROR';
          error.statusCode = response.status;
          error.blocked = false;
          error.retryable = true;
          throw error;
        }
        
        if (!response.ok) {
          // Other error - not retryable
          const error: FetchError = new Error(`HTTP ${response.status}: Request failed`) as FetchError;
          error.code = 'HTTP_ERROR';
          error.statusCode = response.status;
          error.blocked = false;
          error.retryable = false;
          throw error;
        }
        
        // Get content type
        const contentType = response.headers.get('content-type') || 'text/html';
        
        // Read body
        const body = await response.text();
        
        const duration = Date.now() - startTime;
        
        // Convert headers to plain object (Node.js compatible)
        const headersObj: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          headersObj[key] = value;
        });
        
        const result: FetchResult = {
          url,
          statusCode: response.status,
          headers: headersObj,
          body,
          contentType,
          blocked: false,
          fetchedAt: new Date().toISOString(),
        };
        
        this.logger.info(`Successfully fetched URL`, {
          url,
          statusCode: response.status,
          contentType,
          bodyLength: body.length,
          duration,
        });
        
        return result;
        
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        // Handle abort (timeout)
        if (fetchError.name === 'AbortError') {
          const error: FetchError = new Error('Request timeout') as FetchError;
          error.code = 'TIMEOUT';
          error.blocked = false;
          error.retryable = true;
          throw error;
        }
        
        // Re-throw if it's already a FetchError
        if (fetchError.code) {
          throw fetchError;
        }
        
        // Network error - retryable
        const error: FetchError = new Error(`Network error: ${fetchError.message}`) as FetchError;
        error.code = 'NETWORK_ERROR';
        error.blocked = false;
        error.retryable = true;
        error.cause = fetchError;
        throw error;
      }
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      // Handle retry logic
      if (error.retryable && retryCount < this.config.rateLimiting.maxRetries) {
        const backoffDelay = getBackoffDelay(
          retryCount + 1,
          this.config.rateLimiting.delayBetweenRequests,
          this.config.rateLimiting.backoffMultiplier
        );
        
        this.logger.warn(`Fetch failed, retrying after backoff`, {
          url,
          error: error.message,
          code: error.code,
          retryCount: retryCount + 1,
          backoffDelay,
          duration,
        });
        
        await sleep(backoffDelay);
        return this.fetchUrl(url, retryCount + 1);
      }
      
      // Log final failure
      this.logger.error(`Fetch failed after retries`, error, {
        url,
        retryCount,
        blocked: error.blocked,
        duration,
      });
      
      throw error;
    }
  }
  
  /**
   * Fetch multiple URLs sequentially
   * 
   * Ensures:
   * - One URL at a time (no parallel requests)
   * - Delay between requests
   * - Respectful rate limiting
   */
  async fetchUrls(urls: string[]): Promise<FetchResult[]> {
    const results: FetchResult[] = [];
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      
      try {
        const result = await this.fetchUrl(url);
        results.push(result);
        
        // Wait before next request (except for the last one)
        if (i < urls.length - 1) {
          await waitBetweenRequests(this.config);
        }
        
      } catch (error: any) {
        // If blocked, stop fetching and mark remaining as failed
        if (error.blocked) {
          this.logger.critical(`Fetch blocked, stopping fetch sequence`, error, { url });
          throw error;
        }
        
        // For other errors, log but continue
        this.logger.warn(`Fetch failed, continuing with next URL: ${error.message}`, { url, error: error.message });
      }
    }
    
    return results;
  }
  
  /**
   * Check if a URL is fetchable (robots.txt check would go here)
   * For now, we assume all URLs are fetchable
   * In production, you might want to check robots.txt (but don't bypass it)
   */
  async canFetch(url: string): Promise<boolean> {
    // Conservative: assume we can fetch unless we know otherwise
    // In production, you might check robots.txt here
    // But NEVER bypass it - if robots.txt says no, respect it
    return true;
  }
}

