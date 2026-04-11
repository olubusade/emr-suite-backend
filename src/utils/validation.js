import { ZodError } from 'zod';
import { logger } from '../config/logger.js';

/**
 * REQUEST VALIDATION MIDDLEWARE
 * Acts as a generic wrapper for Zod schemas to ensure incoming requests 
 * adhere to the domain's structural and clinical rules.
 */
export const validate = (schema) => (req, res, next) => {
  try {
    // 1. Prepare the validation payload
    // We validate body, params, and query simultaneously to ensure full request integrity.
    const toValidate = { 
      body: req.body, 
      params: req.params, 
      query: req.query 
    };

    /**
     * SCHEMA EXECUTION
     * We perform a strict parse. If successful, we overwrite the request 
     * objects with the 'parsed' versions to ensure type casting (e.g., strings to numbers).
     */
    const parsed = schema.parse(toValidate);

    if (parsed) {
      if (parsed.body) req.body = parsed.body;
      if (parsed.params) req.params = parsed.params;
      if (parsed.query) req.query = parsed.query;
    }

    return next();
  } catch (err) {
    if (err instanceof ZodError) {
      // 2. LOGGING THE VALIDATION FAILURE
      // We log the failure internally for debugging while keeping the client response clean.
      logger.warn('Validation Failure', {
        path: req.originalUrl,
        method: req.method,
        issues: err.issues.map(i => ({ path: i.path, message: i.message }))
      });

      // 3. HUMAN-FRIENDLY ERROR TRANSFORMATION
      const details = err.issues.map(i => {
        // Extract the specific field name that failed
        const fieldName = i.path[i.path.length - 1].toString();
        
        /**
         * FORMATTING LOGIC
         * Converts technical identifiers into readable labels.
         * Example: 'bloodPressure' -> 'Blood Pressure' | 'staff_id' -> 'Staff Id'
         */
        const friendlyField = fieldName
          .replace(/([A-Z])/g, ' $1') 
          .replace(/_/g, ' ')
          .replace(/^./, str => str.toUpperCase())
          .trim();

        return {
          path: fieldName,
          message: `${friendlyField}: ${i.message}`
        };
      });

      // 4. STANDARDIZED ERROR RESPONSE
      // We return a 400 Bad Request with a clear message for the UI to display.
      return res.status(400).json({ 
        success: false, 
        message: details[0].message, // Return the first error as a primary message
        details 
      });
    }

    // Pass non-Zod errors (like syntax errors) to the global error handler
    return next(err);
  }
};