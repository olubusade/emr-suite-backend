import { z } from '../core.js';

export const listAuditSchema = z.object({
  query: z.object({
    page: z.preprocess((v) => Number(v) || 1, z.number()),
    pageSize: z.preprocess((v) => Number(v) || 10, z.number()),
    offset: z.preprocess((v) => (v ? Number(v) : 0), z.number().int().min(0).optional()),
    // Keep the actual database status separate
    search: z.string().optional(),
    entity: z.string().optional(),
  }).passthrough() 
  
});
