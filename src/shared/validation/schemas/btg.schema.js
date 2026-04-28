import { z, uuid } from '../core.js';
import { BTG_STATUS_ENUM } from '../enums/btg.enums.js';

export const breakGlassReadSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? Number(val) : 1)),

    limit: z
      .string()
      .optional()
      .transform((val) => (val ? Number(val) : 20)),

    status: BTG_STATUS_ENUM
      .optional(),

    patientId: z
      .string()
      .uuid('Invalid patientId')
      .optional(),

    requestedBy: z
      .string()
      .uuid('Invalid requestedBy')
      .optional(),
    
    sortBy: z.enum(['createdAt']).optional(),
    order: z.enum(['ASC', 'DESC']).optional(),
  })
});

/**
 * Nurse BTG Request
 */
export const breakGlassRequestSchema = z.object({
  body: z.object({
    patientId: z.string().uuid('Invalid patientId'),
    reason: z.string().min(5, 'Reason is required and must be meaningful'),
    durationMinutes: z.number().int().positive().max(1440, 'Duration cannot exceed 24 hours')
  })
});

/**
 * Admin Approval Schema
 */
export const breakGlassApproveSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid BTG request id')
  }),
  body: z.object({
      decisionReason: z.string().min(5, 'Reason is required and must be meaningful')
  })
})

/**
 * Get Active BTG for a patient
 */

export const getActiveBTGSchema = z.object({
  params: z.object({
    patientId: uuid(),
  })
  
});