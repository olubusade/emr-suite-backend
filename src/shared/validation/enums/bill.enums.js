import { z } from 'zod';
export const BILL_STATUS_ENUM = z.enum(['unpaid', 'pending', 'partially_paid', 'paid', 'cancelled']);