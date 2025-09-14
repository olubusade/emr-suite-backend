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
/**
 * Helper Validators
 */
const uuid = () => z.string().uuid({ message: 'Must be a valid UUID' });
const isoDateString = () =>
  z.string().refine((s) => !Number.isNaN(Date.parse(s)), {
    message: 'Must be a valid ISO date string'
  });

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
    fullName: z.string().min(2),
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
    fullName: z.string().min(2),
    age: z.number().int().positive(),
    diagnosis: z.string().optional()
  })
});

export const updatePatientSchema = z.object({
  params: z.object({ id: uuid() }),
  body: z.object({
    fullName: z.string().min(2).optional(),
    age: z.number().int().positive().optional(),
    diagnosis: z.string().optional()
  })
});

export const getPatientSchema = z.object({
  params: z.object({ id: uuid() })
});

export const deletePatientSchema = z.object({
  params: z.object({ id: uuid() })
});

/* -------------------- Bills -------------------- */
export const createBillSchema = z.object({
  body: z.object({
    patientId: uuid(),
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
  params: z.object({ id: uuid() })
});

export const deleteBillSchema = z.object({
  params: z.object({ id: uuid() })
});

export const listBillSchema = z.object({
  query: z.object({
    limit: z.preprocess((v) => (v ? Number(v) : 100), z.number().int().positive().max(1000).optional()),
    offset: z.preprocess((v) => (v ? Number(v) : 0), z.number().int().min(0).optional())
  })
});

/* -------------------- Appointments -------------------- */
export const createAppointmentSchema = z.object({
  body: z.object({
    patientId: uuid(),
    staffId: uuid(), // doctor/nurse
    appointmentDate: isoDateString(),
    durationMinutes: z.number().int().positive().optional(),
    reason: z.string().max(255).optional(),
    notes: z.string().optional()
  })
});

export const updateAppointmentSchema = z.object({
  params: z.object({ id: uuid() }),
  body: z.object({
    appointmentDate: isoDateString().optional(),
    durationMinutes: z.number().int().positive().optional(),
    reason: z.string().max(255).optional(),
    notes: z.string().optional(),
    status: z.enum(['scheduled', 'completed', 'canceled', 'no_show']).optional(),
    staffId: uuid().optional()
  })
});

export const getAppointmentSchema = z.object({
  params: z.object({ id: uuid() })
});

export const deleteAppointmentSchema = z.object({
  params: z.object({ id: uuid() })
});

export const listAppointmentsSchema = z.object({
  query: z.object({
    limit: z.preprocess((v) => (v ? Number(v) : 100), z.number().int().positive().max(1000).optional()),
    offset: z.preprocess((v) => (v ? Number(v) : 0), z.number().int().min(0).optional()),
    staffId: uuid().optional(),
    patientId: uuid().optional(),
    status: z.enum(['scheduled', 'completed', 'canceled', 'no_show']).optional()
  })
});

/* -------------------- Clinical Notes (SOAP) -------------------- */
export const createClinicalNoteSchema = z.object({
  body: z.object({
    patientId: uuid(),
    staffId: uuid(),
    subjective: z.string().optional(),
    objective: z.string().optional(),
    assessment: z.string().optional(),
    plan: z.string().optional()
  })
});

export const updateClinicalNoteSchema = z.object({
  params: z.object({ id: uuid() }),
  body: z.object({
    subjective: z.string().optional(),
    objective: z.string().optional(),
    assessment: z.string().optional(),
    plan: z.string().optional()
  })
});

export const getClinicalNotesSchema = z.object({
  params: z.object({ id: uuid() })
});

export const listClinicalNotesSchema = z.object({
  params: z.object({ id: uuid() })
});

export const deleteClinicalNoteSchema = z.object({
  params: z.object({ id: uuid() })
});

/* -------------------- Vitals -------------------- */
export const createVitalsSchema = z.object({
  body: z.object({
    patientId: uuid(),
    staffId: uuid(), // nurse who recorded
    appointmentId: uuid().optional(),
    temperature: z.number().min(30).max(45).optional(), // °C
    bloodPressure: z.string().regex(/^\d{2,3}\/\d{2,3}$/).optional(), // e.g. 120/80
    heartRate: z.number().int().min(30).max(220).optional(), // bpm
    respiratoryRate: z.number().int().min(5).max(60).optional(),
    spo2: z.number().min(50).max(100).optional(), // %
    weight: z.number().positive().optional(),
    height: z.number().positive().optional(),
    notes: z.string().optional()
  })
});

export const updateVitalsSchema = z.object({
  params: z.object({ id: uuid() }),
  body: z.object({
    temperature: z.number().min(30).max(45).optional(),
    bloodPressure: z.string().regex(/^\d{2,3}\/\d{2,3}$/).optional(),
    heartRate: z.number().int().min(30).max(220).optional(),
    respiratoryRate: z.number().int().min(5).max(60).optional(),
    spo2: z.number().min(50).max(100).optional(),
    weight: z.number().positive().optional(),
    height: z.number().positive().optional(),
    notes: z.string().optional()
  })
});

export const getVitalsSchema = z.object({
  params: z.object({ id: uuid() })
});

export const deleteVitalsSchema = z.object({
  params: z.object({ id: uuid() })
});

export const listVitalsSchema = z.object({
  query: z.object({
    limit: z.preprocess((v) => (v ? Number(v) : 100), z.number().int().positive().max(1000).optional()),
    offset: z.preprocess((v) => (v ? Number(v) : 0), z.number().int().min(0).optional()),
    patientId: uuid().optional(),
    staffId: uuid().optional(),
    appointmentId: uuid().optional()
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
    limit: z.preprocess((v) => (v ? Number(v) : undefined), z.number().int().positive().max(1000).optional())
  })
});

/* -------------------- Metrics -------------------- */
export const metricsSchema = z.object({
  query: z.object({
    months: z.preprocess((v) => (v ? Number(v) : 12), z.number().int().min(1).max(24).optional())
  })
});
