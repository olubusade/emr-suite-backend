import { z } from 'zod';
export const BTG_STATUS_ENUM = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED','REVOKED']);