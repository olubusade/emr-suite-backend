import { z } from 'zod';
/**
 * 
 * @returns {z.ZodString}
 * @description Helper to validate UUID strings
 * @example
 * const schema = z.object({ id: uuid() });
 * schema.parse({ id: '550e8400-e29b-41d4-a716-446655440000' }); // valid
 * schema.parse({ id: 'invalid-uuid' }); // throws error
 * 
 */

// Helpers
const uuid = () => z.string().uuid({ message: 'Must be a valid UUID' });
const isoDateString = () =>
  z.string().refine((s) => !Number.isNaN(Date.parse(s)), { message: 'Must be a valid ISO date string' });

/* -------------------- Auth -------------------- */
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8)
  })
});

export const refreshSchema = z.object({
  body: z.object({ refreshToken: z.string().min(10) })
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(8),
    newPassword: z.string().min(8)
  })
});

/* -------------------- Users / Staff -------------------- */
export const createStaffSchema = z.object({
  body: z.object({
    email: z.string().email(),
    full_name: z.string().min(2),
    designation: z.string().optional(),
    role: z.string().min(2)
  })
});

export const updateRoleSchema = z.object({
  params: z.object({ id: uuid() }),
  body: z.object({ role: z.string().min(2) })
});

export const setPermissionSchema = z.object({
  params: z.object({ id: uuid() }),
  body: z.object({ permission: z.string(), enabled: z.boolean() })
});

/* -------------------- Patients -------------------- */
export const createPatientSchema = z.object({
  body: z.object({
    full_name: z.string().min(2),
    age: z.number().int().positive(),
    diagnosis: z.string().optional()
  })
});

export const updatePatientSchema = z.object({
  params: z.object({ id: uuid() }),
  body: z.object({
    full_name: z.string().min(2).optional(),
    age: z.number().int().positive().optional(),
    diagnosis: z.string().optional()
  })
});

/* -------------------- Bills -------------------- */
export const createBillSchema = z.object({
  body: z.object({
    patient_id: uuid(),
    amount: z.number().positive(),
    status: z.enum(['paid', 'pending']).optional()
  })
});

export const updateBillSchema = z.object({
  params: z.object({ id: uuid() }),
  body: z.object({
    amount: z.number().positive().optional(),
    status: z.enum(['paid', 'pending']).optional()
  })
});
export const getBillSchema = z.object({
  params: z.object({
    id: uuid()
  })
});
export const listBillSchema = z.object({
  query: z.object({
    limit: z.preprocess(v => v ? Number(v) : 100, z.number().int().positive().max(1000).optional()),
    offset: z.preprocess(v => v ? Number(v) : 0, z.number().int().min(0).optional())
  })
});

/* -------------------- Appointments -------------------- */
export const createAppointmentSchema = z.object({
  body: z.object({
    patient_id: uuid(),
    staff_id: uuid(),             // updated from doctor_id
    appointment_date: isoDateString(), // updated from scheduled_at
    duration_minutes: z.number().int().positive().optional(),
    reason: z.string().max(255).optional(),
    notes: z.string().optional(),
  })
});

export const updateAppointmentSchema = z.object({
  params: z.object({ id: uuid() }),
  body: z.object({
    appointment_date: isoDateString().optional(), // updated
    duration_minutes: z.number().int().positive().optional(),
    reason: z.string().max(255).optional(),
    notes: z.string().optional(),
    status: z.enum(['scheduled', 'completed', 'canceled', 'no_show']).optional(), // match model enum
    staff_id: uuid().optional(), // updated from doctor_id
  })
});

// Validate `GET /appointments/:id` and `DELETE /appointments/:id`
export const getAppointmentSchema = z.object({
  params: z.object({
    id: uuid()
  })
});

// Validate `GET /appointments` with optional query params
export const listAppointmentsSchema = z.object({
  query: z.object({
    limit: z.preprocess(v => v ? Number(v) : 100, z.number().int().positive().max(1000).optional()),
    offset: z.preprocess(v => v ? Number(v) : 0, z.number().int().min(0).optional()),
    staff_id: z.string().uuid().optional(),       // filter by staff
    patient_id: z.string().uuid().optional(),     // filter by patient
    status: z.enum(['scheduled', 'completed', 'canceled', 'no_show']).optional()
  })
});



/* -------------------- Roles / Permissions -------------------- */
export const createRoleSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    description: z.string().optional()
  })
});

export const createPermissionSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    description: z.string().optional()
  })
});

/* -------------------- Audits -------------------- */
export const listAuditSchema = z.object({
  query: z.object({
    limit: z.preprocess(
      (v) => (v ? Number(v) : undefined),
      z.number().int().positive().max(1000).optional()
    )
  })
});

/* -------------------- Metrics -------------------- */
export const metricsSchema = z.object({
  query: z.object({
    months: z.preprocess(
      (v) => (v ? Number(v) : 12),
      z.number().int().min(1).max(24).optional()
    )
  })
});
