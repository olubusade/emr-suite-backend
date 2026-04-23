import { z, uuid } from '../core.js';

/**
 * Register BTG viewer (heartbeat)
 */
export const registerBTGSessionSchema = z.object({
  body: z.object({
    btgId: z.string().uuid('Invalid BTG id'),
    patientId: z.string().uuid('Invalid patientId'),

    // optional future-proofing (safe for EMR scaling)
    deviceId: z.string().uuid().optional(),
    location: z.string().optional()
  })
});
/**
 * Get active viewers
 */
export const getBTGViewersSchema = z.object({
  params: z.object({
    patientId: z.string().uuid('Invalid patientId')
  })
});;