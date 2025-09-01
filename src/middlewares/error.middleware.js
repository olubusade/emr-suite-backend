import ApiError from '../utils/ApiError.js';
import { error } from '../utils/response.js';

/**
 * Global error handling middleware
 */
export function errorHandler(err, req, res, _next) {
  const isKnown = err instanceof ApiError;
  const statusCode = isKnown ? err.statusCode : 500;
  const payload = isKnown
    ? err.details
    : { stack: process.env.NODE_ENV === 'development' ? err.stack : undefined };

  return error(res, statusCode, err.message || 'Unexpected error', payload);
}
