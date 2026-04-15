import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../../config/config.js';
import { logger } from '../../config/logger.js';

/**
 * TOKEN SECURITY UTILITIES
 * Manages Access and Refresh token lifecycles using the project's central config.
 * Note: Variable names (t, s, payload) are preserved to match existing consumption.
 */

// Signs a short-lived access token
export const signAccess = (payload) => jwt.sign(payload, config.jwt.secret, { 
    expiresIn: config.jwt.accessTtl 
});

// Signs a long-lived refresh token using a separate secret
export const signRefresh = (payload) => jwt.sign(payload, config.jwt.refreshSecret, { 
    expiresIn: config.jwt.refreshTtl 
});

// Verifies access token integrity
export const verifyAccess = (t) => {
    try {
        return jwt.verify(t, config.jwt.secret);
    } catch (err) {
        logger.warn('Access token verification failed', { error: err.message });
        throw err;
    }
};

// Verifies refresh token integrity
export const verifyRefresh = (t) => {
    try {
        return jwt.verify(t, config.jwt.refreshSecret);
    } catch (err) {
        logger.warn('Refresh token verification failed', { error: err.message });
        throw err;
    }
};

// Generates a SHA256 hash (preserved for internal token tracking)
export const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

/**
 * Calculates the exact expiry Date of a token.
 * Preserved name: tokenExpiry
 */
export const tokenExpiry = (token) => {
    try {
        const decoded = jwt.decode(token);
        if (!decoded?.exp) return null; // no expiry found
        return new Date(decoded.exp * 1000); // exp is in seconds, convert to ms
    } catch (err) {
        logger.error('Failed to decode token expiry', { error: err.message });
        return null;
    }
};