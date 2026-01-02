/**
 * DELAY UTILITIES
 * 
 * Provides controlled delays between requests to ensure respectful scraping.
 * Always use these utilities instead of setTimeout directly.
 */

import { Config } from '../config.js';

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get a random delay within a range
 * Adds jitter to make request patterns less predictable
 */
export function getRandomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Wait for the configured delay between requests
 * Includes jitter to avoid predictable patterns
 */
export async function waitBetweenRequests(config: Config): Promise<void> {
  const baseDelay = config.rateLimiting.delayBetweenRequests;
  const jitter = baseDelay * 0.2; // ±20% jitter
  const delay = getRandomDelay(baseDelay - jitter, baseDelay + jitter);
  
  await sleep(delay);
}

/**
 * Wait for the configured delay between universities
 */
export async function waitBetweenUniversities(config: Config): Promise<void> {
  await sleep(config.rateLimiting.delayBetweenUniversities);
}

/**
 * Calculate exponential backoff delay
 * Used when retrying after errors
 */
export function getBackoffDelay(attempt: number, baseDelay: number, multiplier: number): number {
  return baseDelay * Math.pow(multiplier, attempt - 1);
}

