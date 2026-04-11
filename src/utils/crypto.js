import crypto from 'crypto';
import { logger } from '../config/logger.js';

/**
 * CORE CRYPTOGRAPHIC UTILITIES
 * Used for generating non-predictable tokens (e.g., password reset, email verification)
 * and creating one-way SHA-256 hashes for data integrity.
 */

/**
 * Generates a cryptographically secure random hex string.
 * Used for high-entropy tokens.
 * @param {number} bytes - The number of random bytes to generate.
 * @returns {string} Hexadecimal string.
 */
export function randomToken(bytes = 32) {
  try {
    // We use CSPRNG (Cryptographically Secure Pseudo-Random Number Generator)
    return crypto.randomBytes(bytes).toString('hex'); 
  } catch (err) {
    logger.error('Random token generation failed', { error: err.message });
    // Fallback using timestamp and random for extreme fail-safe, 
    // though crypto.randomBytes is highly reliable in Node.js.
    return crypto.createHash('sha256').update(`${Date.now()}-${Math.random()}`).digest('hex');
  }
}

/**
 * Creates a SHA-256 hash of a given value.
 * Commonly used for hashing tokens before DB storage or verifying file integrity.
 * @param {string|number} value - The input to be hashed.
 * @returns {string} 64-character hex hash.
 */
export function hashSha256(value) {
  try {
    return crypto
      .createHash('sha256')
      .update(String(value))
      .digest('hex');
  } catch (err) {
    logger.error('SHA-256 hashing failed', { error: err.message });
    throw new Error('Cryptographic failure: Could not process hash');
  }
}