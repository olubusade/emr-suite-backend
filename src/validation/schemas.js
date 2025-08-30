import { z } from 'zod';

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
    status: z.enum(['PAID', 'PENDING']).optional()
  })
});

export const updateBillSchema = z.object({
  params: z.object({ id: uuid() }),
  body: z.object({
    amount: z.number().positive().optional(),
    status: z.enum(['PAID', 'PENDING']).optional()
  })
});

/* -------------------- Appointments -------------------- */
export const createAppointmentSchema = z.object({
  body: z.object({
    patient_id: uuid(),
    doctor_id: uuid(),
    scheduled_at: isoDateString(),
    duration_minutes: z.number().int().positive().optional(),
    reason: z.string().max(255).optional(),
    notes: z.string().optional()
  })
});

export const updateAppointmentSchema = z.object({
  params: z.object({ id: uuid() }),
  body: z.object({
    scheduled_at: isoDateString().optional(),
    duration_minutes: z.number().int().positive().optional(),
    reason: z.string().max(255).optional(),
    notes: z.string().optional(),
    status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED']).optional(),
    doctor_id: uuid().optional()
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
