// utils/jwtService.js
import * as jwtUtil from './jwt.js';
import ApiError from './ApiError.js';

/**
 * Generate access and refresh tokens
 * @param {Object} payload - JWT payload
 * @returns {{ accessToken: string, refreshToken: string }}
 */
export function generateAuthTokens(payload) {
  const accessToken = jwtUtil.signAccess(payload);
  const refreshToken = jwtUtil.signRefresh(payload);
  return { accessToken, refreshToken };
}

/**
 * Verify access token
 * @param {string} token
 * @returns {Object} decoded payload
 * @throws {ApiError} if token is invalid or expired
 */
export function verifyAccess(token) {
  try {
    return jwtUtil.verifyAccess(token);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired access token');
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
    return jwtUtil.verifyRefresh(token);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }
}
