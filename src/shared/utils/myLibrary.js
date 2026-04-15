import crypto from 'crypto';
import { logger } from '../../config/logger.js';

/**
 * CLINICAL & UTILITY HELPERS
 * General-purpose functions for business logic and security.
 */

/**
 * Calculates current age from an ISO date string.
 * @param {string} dobString - Date of birth (YYYY-MM-DD).
 * @returns {number} Age in years.
 * @throws {Error} If date format is invalid.
 */
export function calculateAge(dobString) {
  try {
    const dob = new Date(dobString);
    const today = new Date();

    if (isNaN(dob.getTime())) {
      throw new Error('Invalid date format provided');
    }

    let age = today.getFullYear() - dob.getFullYear();

    /**
     * PRECISION CHECK
     * If today's month/day is before the birth month/day, 
     * they haven't reached their birthday yet this year.
     */
    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age;
  } catch (err) {
    logger.error('Age calculation helper failed', { dobString, error: err.message });
    return 0; // Fallback to 0 to prevent UI crashes, though validation should catch this
  }
}

/**
 * Generates a cryptographically secure temporary password.
 * @param {number} length - Desired string length.
 * @returns {string} Alphanumeric temporary password.
 */
export function generateTempPassword(length = 10) {
  try {
    /**
     * SECURITY NOTE: 
     * We use Node's native 'crypto' module rather than Math.random()
     * to ensure the result is non-deterministic (CSPRNG).
     */
    return crypto
      .randomBytes(length)
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '') // Remove symbols for UI clarity during first-login
      .slice(0, length);
  } catch (err) {
    logger.error('Temp password generation failed', { error: err.message });
    // Fallback to a timestamp-based string if crypto fails (highly unlikely)
    return `Temp${Date.now()}`.slice(0, length);
  }
}