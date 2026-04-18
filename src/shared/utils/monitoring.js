import { logger } from '../../config/logger.js';

const isProduction = process.env.NODE_ENV === 'production';
/**
 * MONITORING UTILITY
 * Handles internal system alerts and error reporting.
*/

export const reportError = (error, context = {}) => {
  
  const timestamp = new Date().toISOString();

  const errorDetail = {
    timestamp,
    message: error.message,
    stack: !isProduction ? error.stack : undefined,
    ...context,
  };

  if (isProduction) {
    // In Production, we log as a single stringified JSON for log aggregators
    logger.error('SYSTEM_ERROR', { 
      message: error.message, 
      ...errorDetail 
    });
    
    // NOTE: This is where you would call an external service like Sentry or a Slack Webhook
    // if (process.env.SENTRY_DSN) Sentry.captureException(error, { extra: context });
  } else {
    // In Development, we want high visibility in the terminal
    console.error('\x1b[31m%s\x1b[0m', '--- [MONITORING ALERT] ---');
    console.table(context);
    console.error(error);
  }
};

export const logSecurityAlert = (message, context = {}) => {
  
  const timestamp = new Date().toISOString();
  const detail = {
    timestamp,
    message,
    ...context,
  };

  if (isProduction) {
    logger.warn(`[SECURITY_ALERT] ${message}`, detail);
  } else {
    console.warn('\x1b[33m%s\x1b[0m', `⚠️ SECURITY ALERT: ${message}`);
    if (Object.keys(context).length > 0) console.table(context);
  }
};