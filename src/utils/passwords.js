import bcrypt from 'bcryptjs';
import { logger } from '../config/logger.js';

/**
 * CRYPTOGRAPHIC UTILITIES
 * Handles secure password hashing and verification.
 * * We use bcryptjs for its consistent behavior across different 
 * environments (Windows/Linux/Docker) without needing native build tools.
 */

/**
 * Hashes a plain-text password using a secure salt.
 * @param {string} password - The raw password from the user.
 * @returns {Promise<string>} The hashed password string.
 */
export const hashPassword = async (password) => {
  try {
    // 10 rounds is the current industry 'sweet spot' for security vs. performance.
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  } catch (err) {
    logger.error('Password hashing failed', { error: err.message });
    throw new Error('Security utility error: Could not process password');
  }
};

/**
 * Compares a plain-text password against a stored hash.
 * @param {string} password - The input password.
 * @param {string} hash - The hashed password from the database.
 * @returns {Promise<boolean>} True if match, false otherwise.
 */
export const comparePassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (err) {
    logger.error('Password comparison failed', { error: err.message });
    return false; // Fail safe by returning false rather than throwing
  }
};