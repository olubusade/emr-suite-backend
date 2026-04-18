import { z, uuid } from '../core.js';
import { BILL_STATUS_ENUM } from '../../validation/enums/bill.enums.js';
import { PAYMENT_METHOD_ENUM} from '../../validation/enums/payment.enums.js';
import { SORT_DIRECTION_ENUM } from '../../validation/enums/filter-direction.enums.js';


export const createBillSchema = z.object({
  body: z.object({
    patientId: uuid(),
    appointmentId: uuid(),
    amount: z.number().positive(),
    status: BILL_STATUS_ENUM.default('unpaid'),
    dueDate: z.string().or(z.date()).optional(),
    paymentMethod: PAYMENT_METHOD_ENUM.nullable().optional(),
    notes: z.string().max(500).optional()
  })
});

export const updateBillSchema = z.object({
  params: z.object({ 
    id: uuid() 
  }),
  body: z.object({
    amount: z.number().positive().optional(),
    status: BILL_STATUS_ENUM.optional(),
    paymentMethod: PAYMENT_METHOD_ENUM.nullable().optional(),
    dueDate: z.string().or(z.date()).optional(),
    notes: z.string().max(500).optional()
  })
});

export const getBillSchema = z.object({
  params: z.object({ id: uuid() })
});

export const deleteBillSchema = z.object({
  params: z.object({ id: uuid() })
});

export const listBillSchema = z.object({
  query: z.object({
    page: z.preprocess((v) => Number(v) || 1, z.number()),
    limit: z.preprocess((v) => Number(v) || 20, z.number()),
    offset: z.preprocess((v) => (v ? Number(v) : 0), z.number().int().min(0).optional()),
    // Keep the actual database status separate
    status: BILL_STATUS_ENUM.optional(),
    search: z.string().optional(),
    paymentMethod: PAYMENT_METHOD_ENUM.optional(),
    sortBy: z.string().optional(),
    sortDirection: SORT_DIRECTION_ENUM.optional()
  }).passthrough()    
});

export const getPendingBillsSchema = z.object({
  query: z.object({
    page: z.string().optional().transform(Number),
    limit: z.string().optional().transform(Number),
    search: z.string().optional(), // For searching patient name/phone
    startDate: z.string().datetime().optional(),
  })
});
