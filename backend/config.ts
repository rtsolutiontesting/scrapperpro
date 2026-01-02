/**
 * CONFIGURATION
 * 
 * Environment-based configuration for the data ingestion engine.
 * All scraping behavior is controlled here to ensure safe, respectful operation.
 */

export interface Config {
  /** Environment (dev, staging, prod) */
  env: 'dev' | 'staging' | 'prod';
  
  /** Firebase configuration */
  firebase: {
    projectId: string;
    // Other Firebase config loaded from environment or Firebase Admin SDK
  };
  
  /** Rate limiting configuration */
  rateLimiting: {
    /** Delay between requests in milliseconds (default: 5000-10000ms) */
    delayBetweenRequests: number;
    /** Delay between universities in milliseconds */
    delayBetweenUniversities: number;
    /** Maximum retries for failed requests */
    maxRetries: number;
    /** Backoff multiplier for retries */
    backoffMultiplier: number;
  };
  
  /** Fetch configuration */
  fetch: {
    /** Request timeout in milliseconds */
    timeout: number;
    /** User-Agent strings (rotated) */
    userAgents: string[];
    /** Additional headers to include */
    headers: Record<string, string>;
  };
  
  /** AI verification configuration */
  ai: {
    /** Enable AI verification (should be enabled in prod) */
    enabled: boolean;
    /** API key for AI service */
    apiKey?: string;
    /** Minimum confidence score to require AI verification */
    aiVerificationThreshold: number;
  };
  
  /** Job configuration */
  job: {
    /** Maximum concurrent jobs */
    maxConcurrentJobs: number;
    /** Job timeout in milliseconds */
    jobTimeout: number;
  };
  
  /** Logging configuration */
  logging: {
    /** Log level */
    level: 'debug' | 'info' | 'warn' | 'error';
    /** Enable structured logging */
    structured: boolean;
  };
}

/**
 * Get configuration from environment variables
 * 
 * Conservative defaults ensure safe operation even if env vars are missing
 */
export function getConfig(): Config {
  const env = (process.env.NODE_ENV || 'dev') as 'dev' | 'staging' | 'prod';
  
  return {
    env,
    firebase: {
      projectId: process.env.FIREBASE_PROJECT_ID || '',
    },
    rateLimiting: {
      // Conservative delays: 5-10 seconds between requests
      delayBetweenRequests: parseInt(process.env.DELAY_BETWEEN_REQUESTS || '7500', 10),
      delayBetweenUniversities: parseInt(process.env.DELAY_BETWEEN_UNIVERSITIES || '10000', 10),
      maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
      backoffMultiplier: parseFloat(process.env.BACKOFF_MULTIPLIER || '2.0'),
    },
    fetch: {
      timeout: parseInt(process.env.FETCH_TIMEOUT || '30000', 10), // 30 seconds
      userAgents: [
        // Human-like user agents (rotated)
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      ],
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    },
    ai: {
      enabled: process.env.AI_ENABLED !== 'false',
      apiKey: process.env.GEMINI_API_KEY || process.env.AI_API_KEY,
      aiVerificationThreshold: parseInt(process.env.AI_VERIFICATION_THRESHOLD || '70', 10),
    },
    job: {
      maxConcurrentJobs: parseInt(process.env.MAX_CONCURRENT_JOBS || '1', 10), // One at a time by default
      jobTimeout: parseInt(process.env.JOB_TIMEOUT || '600000', 10), // 10 minutes
    },
    logging: {
      level: (process.env.LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error',
      structured: process.env.STRUCTURED_LOGGING !== 'false',
    },
  };
}

/**
 * Validate configuration
 * Throws if critical config is missing
 */
export function validateConfig(config: Config): void {
  if (!config.firebase.projectId && config.env === 'prod') {
    throw new Error('FIREBASE_PROJECT_ID is required in production');
  }
  
  if (config.rateLimiting.delayBetweenRequests < 1000) {
    throw new Error('delayBetweenRequests must be at least 1000ms for safe operation');
  }
  
  if (config.ai.enabled && !config.ai.apiKey) {
    console.warn('AI verification is enabled but no API key provided');
  }
}


