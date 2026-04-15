import { STATUS } from '../../constants/index.js';
import ApiError from '../utils/ApiError.js';
import { logger } from './../../config/logger.js';

/**
 * GLOBAL ERROR HANDLING MIDDLEWARE
 * Standardizes all API error responses across the EMR system.
 */
export function errorHandler(err, req, res, _next) {
  const isKnown = err instanceof ApiError;
  const statusCode = isKnown ? err.statusCode : 500;

  // =====================================================
  // 1. LOG EVERYTHING (ALWAYS EXECUTES FIRST)
  // =====================================================
  logger.error({
    message: err.message,
    statusCode,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id || 'anonymous',
    stack: err.stack,
    details: err.details || null
  });

  // =====================================================
  // 2. HANDLE CLIENT / EXPECTED ERRORS (400–499)
  // =====================================================
   if (statusCode >= 400 && statusCode < 500) {
    return res.status(statusCode).json({
      status: STATUS.FAIL,
      message: err.message,
      details: err.details || null
    });
  }

  // =====================================================
  // 3. HANDLE SERVER / UNEXPECTED ERRORS (500+)
  // =====================================================
  // SERVER ERRORS (500+)
  return res.status(500).json({
    status: STATUS.ERROR,
    message: 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.stack : null
  });
}