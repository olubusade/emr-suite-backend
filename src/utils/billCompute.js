import { logger } from '../config/logger.js';

/**
 * BILLING & REVENUE LOGIC
 * Pure functions for calculating financial states within the EMR.
 */

/**
 * Determines the status of a bill based on associated payment records.
 * @param {Object} bill - The bill object containing at least the 'amount'.
 * @param {Array} payments - Array of payment objects with 'amountPaid'.
 * @returns {'pending' | 'partially_paid' | 'paid'}
 */
export function computeBillStatus(bill, payments) {
  try {
    // We cast to Number to ensure mathematical accuracy 
    // and handle potential string inputs from the DB.
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amountPaid), 0);
    const billAmount = Number(bill.amount);

    /**
     * PRECISION HANDLING
     * In financial logic, we use a small epsilon or rounding to avoid
     * floating-point math errors (e.g., 0.1 + 0.2 !== 0.3).
     */
    const roundedTotal = Math.round(totalPaid * 100) / 100;
    const roundedBill = Math.round(billAmount * 100) / 100;

    if (roundedTotal === 0) return 'pending';
    
    if (roundedTotal < roundedBill) {
      return 'partially_paid';
    }

    return 'paid';
  } catch (err) {
    logger.error('Failed to compute bill status', { 
      billId: bill?.id, 
      error: err.message 
    });
    // Default to 'pending' if calculation fails to prevent accidental 'paid' status
    return 'pending'; 
  }
}