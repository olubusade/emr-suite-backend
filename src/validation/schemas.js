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
/** * 1. DOMAIN ENUMERATIONS
 * Centralized constants matching the Database and Clinical standards.
 * Moving these to the top ensures they act as a "Single Source of Truth."
 */
const GENDER_ENUM = z.enum(['male', 'female', 'other', 'unknown']);
const MARITAL_ENUM = z.enum(['single', 'married', 'divorced', 'widowed', 'separated']);
const BLOOD_ENUM = z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);
const GENOTYPE_ENUM = z.enum(['AA', 'AS', 'SS', 'AC', 'SC']);
const BILL_STATUS_ENUM = z.enum(['unpaid', 'pending', 'partially_paid', 'paid', 'cancelled']);
const APPOINTMENT_STATUS_ENUM = z.enum(["scheduled", "checked_in", "awaiting_vitals", "vitals_taken", "in_consultation", "completed","canceled"]);
const APPOINTMENT_TIMEFRAME_ENUM = z.enum(['PAST', 'UPCOMING', 'TODAY', 'ALL']);
const PAYMENT_METHOD_ENUM = z.enum(['cash', 'card', 'insurance', 'transfer']);
const SORT_DIRECTION_ENUM = z.enum(['desc', 'asc']);

/**
 * 2. SHARED VALIDATION PRIMITIVES
 * Reusable helpers for structural integrity (UUIDs, Dates, Regex).
 */
const uuid = () => z.string().uuid({ message: 'Must be a valid UUID' });
const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{7,15}$/;

const isoDateString = () =>
  z.string().refine((s) => !Number.isNaN(Date.parse(s)), {
    message: 'Must be a valid ISO date string'
  });

/* -------------------- AUTHENTICATION -------------------- */
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

/* -------------------- PATIENT MANAGEMENT -------------------- */
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

/* -------------------- FINANCIAL (BILLING) -------------------- */
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

/* -------------------- Appointments -------------------- */
export const createAppointmentSchema = z.object({
  body: z.object({
    patientId: uuid(),
    staffId: uuid(),
    appointmentDate: isoDateString(),
    // 🔑 Add validation for the time string
    appointmentTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
    reason: z.string().max(255).optional(),
    notes: z.string().optional()
  })
});

export const updateAppointmentSchema = z.object({
  params: z.object({ id: uuid() }),
  body: z.object({
    appointmentDate: isoDateString().optional(),
    appointmentTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(), // 🔑 Added
    reason: z.string().max(255).optional(),
    notes: z.string().optional(),
    status: APPOINTMENT_STATUS_ENUM.optional(),
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
    timeFrame: APPOINTMENT_TIMEFRAME_ENUM.optional(),
    staffId: uuid().optional(),
    patientId: uuid().optional(),
    // Keep the actual database status separate
    status: APPOINTMENT_STATUS_ENUM.optional(),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortDirection: SORT_DIRECTION_ENUM.optional(),
  })
    .passthrough()
});

/* -------------------- Clinical Notes (SOAP) -------------------- */
export const createClinicalNoteSchema = z.object({
  body: z.object({
    // These should be verified in the controller using a middleware or database lookup
    patientId: z.string().uuid(),
    appointmentId: z.string().uuid(),
    
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

/**
 * Validates the request for retrieving all clinical notes for a patient (History)
 * URL Pattern: /clinical/patient/:patientId
 */
export const getClinicalNotesByPatientSchema = z.object({
  params: z.object({
    patientId: z.string({
      required_error: "Patient ID is required",
    }).uuid({ message: "Invalid Patient ID format" }),
  }),
  query: z.object({
    limit: z.string().optional(),
    page: z.string().optional()
  }).optional()
});

/**
 * Validates the request for retrieving a note for a specific session
 * URL Pattern: /clinical/appointment/:appointmentId
 */
export const getClinicalNotesByAppointmentSchema = z.object({
  params: z.object({
    appointmentId: z.string().uuid(),
  }),
  query: z.object({
    patientId: z.string().uuid(),
  }),
});

export const deleteClinicalNoteSchema = z.object({
  params: z.object({ id: uuid() })
});

/* -------------------- Vitals -------------------- */
export const createVitalSchema = z.object({
  body: z.object({
    patientId: uuid(), 
    appointmentId: uuid(),
    
    readingAt: z.string().datetime(), // ISO 8601 format

    // Clinical Data Points
    temperature: z.number().min(30).max(45).optional(),
    heartRate: z.number().int().min(30).max(200).optional(),
    
    // BP Regex for "120/80" format
    bloodPressure: z.string()
    .regex(/^\d{2,3}\/\d{2,3}$/, "Invalid format. Use Sys/Dia")
    .optional()
    .refine((val) => {
      if (!val) return true;
      const [sys, dia] = val.split('/').map(Number);
      return sys > dia; // 🩺 Clinical Rule: Systolic must always be higher than Diastolic
    }, {
      message: "Systolic pressure must be greater than diastolic pressure"
    }),
    
    respiratoryRate: z.number().int().min(5).max(60).optional(),
    weightKg: z.number().positive().optional(),
    heightCm: z.number().positive().optional(),
    spo2: z.preprocess(
      (val) => (val === '' ? null : val), // Pre-processor handles empty strings from HTML forms
      z.number().min(0).max(100).nullable()
    ),
    painScale: z.number().int().min(0).max(10).optional(),
    
    notes: z.string().optional(),
  }),
});

export const updateVitalSchema = z.object({
  params: z.object({ id: uuid() }),
  body: z.object({
    //Note: patientId, appointmentId, and nurseId are omitted (Immutable)
    temperature: z.number().min(30).max(45).optional(),
    bloodPressure: z.string()
    .regex(/^\d{2,3}\/\d{2,3}$/, "Invalid format. Use Sys/Dia")
    .optional()
    .refine((val) => {
      if (!val) return true;
      const [sys, dia] = val.split('/').map(Number);
      return sys > dia; // 🩺 Clinical Rule: Systolic must always be higher than Diastolic
    }, {
      message: "Systolic pressure must be greater than diastolic pressure"
    }),
    heartRate: z.number().int().min(30).max(220).optional(),
    respiratoryRate: z.number().int().min(5).max(60).optional(),
    spo2: z.number().min(50).max(100).optional(),
    weightKg: z.number().positive().optional(), // 🔑 Matched to weightKg
    heightCm: z.number().positive().optional(), // 🔑 Matched to heightCm
    notes: z.string().optional()
  })
});

export const getVitalsSchema = z.object({
  params: z.object({ id: uuid() })
});

export const getVitalByPatientSchema = z.object({
  params: z.object({
    // Validates that /vitals/patient/:patientId is a valid UUID
    patientId: z.string({
      required_error: "Patient ID is required",
    }).uuid({ message: "Invalid Patient ID format" }),
  }),
  query: z.object({
    // Optional: useful if you want to limit history or filter by date
    limit: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }).optional(),
});

export const getVitalsByAppointmentSchema = z.object({
  params: z.object({
    appointmentId: z.string().uuid(),
  }),
  query: z.object({
    patientId: z.string().uuid(),
  }),
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
