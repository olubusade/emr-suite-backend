import { z } from 'zod';

/**
 * SHARED VALIDATION PRIMITIVES
 * Reusable helpers for structural integrity (UUIDs, Dates, Regex).
 */
/**
 * 
 * @returns uuid
 */
export const uuid = () => z.string().uuid({ message: 'Must be a valid UUID' });
/**
 * Phone Regular Expression
 */
export const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{7,15}$/;

/**
 * Reusable UUID validator
 */
export const nonEmptyString = (field = 'Field') =>
  z.string().min(1, `${field} is required`);

export const isoDateString = () =>
  z.string().refine((s) => !Number.isNaN(Date.parse(s)), {
    message: 'Must be a valid ISO date string'
});
/**
 * Re-export zod so you never import it again everywhere
 */
export { z };