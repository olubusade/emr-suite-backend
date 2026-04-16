import { isoDateString, z, uuid } from '../core.js';

export const metricsSchema = z.object({
  query: z.object({
    months: z.preprocess((v) => (v ? Number(v) : 12), z.number().int().min(1).max(24).optional())
  })
});