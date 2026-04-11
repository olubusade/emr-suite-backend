/**
 * CUSTOM API ERROR CLASS
 * Extends the native Error object to include HTTP-specific context.
 * This allows the global error handler to differentiate between 
 * operational errors and programming bugs.
 */
export default class ApiError extends Error {
    /**
     * @param {number} statusCode - The HTTP Status Code (e.g., 404, 401).
     * @param {string} message - Human-readable error message.
     * @param {any} details - Optional extra context (e.g., validation issues).
     */
    constructor(statusCode, message, details = null) {
        // 1. Pass the message to the parent Error class
        super(message);
        
        // 2. Attach the metadata required for the Response Utility
        this.statusCode = statusCode;
        this.details = details;

        /**
         * 3. STACK TRACE CAPTURE
         * This removes the constructor call from the stack trace, making 
         * logs much cleaner and focused on where the error actually occurred.
         */
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}