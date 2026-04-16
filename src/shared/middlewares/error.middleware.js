import { STATUS } from '../../constants/index.js';
import ApiError from '../utils/ApiError.js';
import { logger } from './../../config/logger.js';

/**
 * GLOBAL ERROR HANDLING MIDDLEWARE
 * Standardizes all API error responses across the EMR system.
 */
export function errorHandler(err, req, res, _next) {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;
  const isClientError = statusCode >= 400 && statusCode < 500;

  // ==============================
  // LOGGING STRATEGY
  // ==============================
  if (!isClientError || !isApiError) {
    logger.error({
      message: err.message || 'Unexpected error',
      statusCode,
      path: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userId: req.user?.id || 'anonymous',
      stack: err.stack,
      details: err.details || null
    });
  } else {
    logger.warn({
      message: err.message,
      path: req.originalUrl,
      method: req.method,
      userId: req.user?.id || 'anonymous',
      details: err.details || null
    });
  }

  // ==============================
  // CLIENT ERRORS
  // ==============================
  if (isClientError) {
    return res.status(statusCode).json({
      status: STATUS.FAIL,
      message: err.message,
      details: err.details || null
    });
  }

  // ==============================
  // SERVER ERRORS
  // ==============================
  return res.status(500).json({
    status: STATUS.ERROR,
    message: 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.stack : null
  });
}