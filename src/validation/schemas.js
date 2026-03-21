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
const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{7,15}$/;

// ENUMS matching the PatientModel.js
const GENDER_ENUM = z.enum(['male', 'female', 'other', 'unknown']);
const MARITAL_ENUM = z.enum(['single', 'married', 'divorced', 'widowed', 'separated']);
const BLOOD_ENUM = z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);
const GENOTYPE_ENUM = z.enum(['AA', 'AS', 'SS', 'AC', 'SC']);

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
    // --- MANDATORY FIELDS (Core Identity & Auth) ---
    firstName: z.string().trim().min(2, 'First name must be at least 2 characters.'),
    lastName: z.string().trim().min(2, 'Last name must be at least 2 characters.'),
    email: z.string().email('Invalid email format.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'), // Increased security minimum

    dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of Birth must be in YYYY-MM-DD format.'),
    gender: GENDER_ENUM.default('unknown'), // Ensure the default value is included if not provided
    
    // --- OPTIONAL FIELDS (Demographics & Medical) ---
    middleName: z.string().trim().optional(),
    maritalStatus: MARITAL_ENUM.optional(),
    
    phone: z.string().regex(phoneRegex, 'Invalid phone number format.').optional(),
    
    nationalId: z.string().optional(), // For compliance
    address: z.string().trim().optional(),
    occupation: z.string().trim().optional(),
    nationality: z.string().trim().optional(),
    stateOfOrigin: z.string().trim().optional(),
    
    bloodGroup: BLOOD_ENUM.optional(),
    genotype: GENOTYPE_ENUM.optional(),

    // --- EMERGENCY CONTACT ---
    emergencyContactName: z.string().trim().optional(),
    emergencyContactPhone: z.string().regex(phoneRegex, 'Invalid phone number format.').optional(),
    emergencyRelationship: z.string().trim().optional(),
    
    profileImage: z.string().url('Profile image must be a valid URL.').optional()
  }),
});

export const updatePatientSchema = z.object({
  params: z.object({ id: uuid() }),
  body: createPatientSchema.shape.body.partial().extend({
    // Password still needs its own specific validation/message
    password: z.string().min(8, 'Password must be at least 8 characters.').optional(),
    // Just allow them to be sent if they meet the basic type validation.
    // The Service will ignore them.
    email: z.string().email().optional(), 
    role: z.string().optional(),
  }),
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
    page: z.preprocess((v) => Number(v) || 1, z.number()),
    limit: z.preprocess((v) => Number(v) || 20, z.number()),
    offset: z.preprocess((v) => (v ? Number(v) : 0), z.number().int().min(0).optional()),
    //Allow the new timeFrame flag
    timeFrame: z.enum(['PAST', 'UPCOMING', 'TODAY']).optional(),
    staffId: uuid().optional(),
    patientId: uuid().optional(),
    // Keep the actual database status separate
    status: z.enum(['scheduled', 'completed', 'canceled', 'no_show']).optional(),
    search: z.string().optional(),
  })
    //.passthrough()
});

/* -------------------- Clinical Notes (SOAP) -------------------- */
export const createClinicalNoteSchema = z.object({
  body: z.object({
    // These should be verified in the controller using a middleware or database lookup
    patientId: z.string().uuid(),
    
    // The staffId is typically pulled from req.user.id (the authenticated doctor)
    // but should be accepted if the staff is creating a note for another staff member (rare)
    staffId: z.string().uuid().optional(), 
    
    diagnosis: z.string().min(3).max(1000).optional(),
    subjective: z.string().optional(),
    objective: z.string().optional(),
    assessment: z.string().optional(),
    plan: z.string().optional(),
  }),
});

export const updateClinicalNoteSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: createClinicalNoteSchema.shape.body.partial()
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
export const createVitalSchema = z.object({
  body: z.object({
    // Mandatory field (Must match a valid patient)
    patientId: z.string().uuid(), 
    
    // Mandatory field (When the reading was taken)
    readingAt: z.string().datetime(), // Ensures ISO 8601 format (e.g., 2025-10-25T14:30:00.000Z)

    // Optional fields with specific types and ranges
    temperature: z.number().min(30).max(45).optional(), // Realistic temperature range
    heartRate: z.number().int().min(30).max(200).optional(),
    
    // String format validation for "Systolic/Diastolic"
    bloodPressure: z.string().regex(/^\d{2,3}\/\d{2,3}$/, 'Format must be Sys/Dia (e.g., 120/80)').optional(), 
    
    respiratoryRate: z.number().int().min(5).max(40).optional(),

    weightKg: z.number().min(0).optional(),
    heightCm: z.number().min(0).optional(),
    spo2: z.number().int().min(0).max(100).optional(), // Oxygen saturation
    painScale: z.number().int().min(0).max(10).optional(),
    
    notes: z.string().optional(),
    
    // nurseId is often pulled from req.user.id, but allow it to be passed if needed
    nurseId: z.string().uuid().optional(),
  }),
});

export const updateVitalSchema = z.object({
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

export const deleteVitalSchema = z.object({
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
