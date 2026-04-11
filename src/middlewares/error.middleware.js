import ApiError from '../utils/ApiError.js';
import { error } from '../utils/response.js';
import { logger } from '../config/logger.js'; // Import your new logger

/**
 * Global error handling middleware
 */
export function errorHandler(err, req, res, _next) {
  const isKnown = err instanceof ApiError;
  const statusCode = isKnown ? err.statusCode : 500;
  
  // 1. Log the error for the internal 'Observer' layer
  // We log more details than we show the user
  logger.error({
    message: err.message,
    statusCode,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    stack: err.stack, // Always log the stack trace internally for debugging
    userId: req.user?.id || 'anonymous' // If you have auth middleware
  });

  // 2. Prepare the payload for the client (Client-facing)
  const payload = isKnown
    ? err.details
    : { 
        // Only show stack trace in development to avoid leaking system info
        stack: process.env.ENV === 'development' ? err.stack : undefined 
      };

  // 3. Return a clean response
  return error(res, statusCode, err.message || 'Unexpected error', payload);
}