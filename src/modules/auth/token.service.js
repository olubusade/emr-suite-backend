// utils/jwtService.js
import * as jwtUtil from './jwt.js';
import ApiError from './ApiError.js';
import { reportError } from './monitoring.js';

/**
 * JWT SERVICE UTILITY
 * Standardized wrapper for token operations.
 * Centralizes error mapping to prevent JWT-specific leaks to the client.
 */
/**
 * Generate access and refresh tokens
 * @param {Object} payload - JWT payload
 * @returns {{ accessToken: string, refreshToken: string }}
 */
export function generateAuthTokens(payload) {
  try {
    const accessToken = jwtUtil.signAccess(payload);
    const refreshToken = jwtUtil.signRefresh(payload);
    return { accessToken, refreshToken };  
  } catch (err) {
    reportError(err, { utility: 'jwtService', operation: 'generateAuthTokens' });
    throw new ApiError(500, 'Failed to initialize secure session');
  }
  
}

/**
 * Verify access token
 * @param {string} token
 * @returns {Object} decoded payload
 * @throws {ApiError} if token is invalid or expired
 */
export function verifyAccess(token) {
  try {
    if (!token) throw new Error('No token provided');
    return jwtUtil.verifyAccess(token);
  } catch (err) {
    // Distinguish between expired and tampered tokens for internal logs
    const isExpired = err.name === 'TokenExpiredError';
    
    if (!isExpired) {
      reportError(err, { utility: 'jwtService', operation: 'verifyAccess', severity: 'low' });
    }

    throw new ApiError(401, isExpired ? 'Access session expired' : 'Invalid access credentials');
  }
}

/**
 * Verify refresh token
 * @param {string} token
 * @returns {Object} decoded payload
 * @throws {ApiError} if token is invalid or expired
 */
export function verifyRefresh(token) {
  try {
    if (!token) throw new Error('No refresh token provided');
    return jwtUtil.verifyRefresh(token);
  } catch (err) {
    const isExpired = err.name === 'TokenExpiredError';
    
    // Refresh token failures are higher priority security events
    reportError(err, { utility: 'jwtService', operation: 'verifyRefresh', severity: 'medium' });

    throw new ApiError(401, isExpired ? 'Refresh session expired' : 'Invalid refresh credentials');
  }
}
