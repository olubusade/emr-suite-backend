import { z } from 'zod';
export const PAYMENT_METHOD_ENUM = z.enum(['cash', 'card', 'insurance', 'transfer']);