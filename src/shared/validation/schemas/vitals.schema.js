import { z, uuid } from '../core.js';
import { CONSCIOUSNESS_LEVEL_ENUM, HEIGHT_UNIT_ENUM, SOURCE_ENUM, TEMP_UNIT_ENUM, TRIAGE_LEVEL_ENUM, WEIGHT_UNIT_ENUM } from '../enums/vital.enums.js';

export const createVitalSchema = z.object({
  body: z.object({
    patientId: uuid(),
    appointmentId: uuid(),
    readingAt: z.string().datetime(),

    // Clinical Vitals
    temperature: z.number().min(30).max(45).optional(),
    heartRate: z.number().int().min(30).max(220).optional(),
    respiratoryRate: z.number().int().min(5).max(60).optional(),

    bloodPressure: z.string()
      .regex(/^\d{2,3}\/\d{2,3}$/, "Invalid format. Use Sys/Dia")
      .optional()
      .refine((val) => {
        if (!val) return true;
        const [sys, dia] = val.split('/').map(Number);
        return sys > dia;
      }, {
        message: "Systolic pressure must be greater than diastolic pressure"
      }),

    weightKg: z.number().positive().optional(),
    heightCm: z.number().positive().optional(),

    spo2: z.preprocess(
      (val) => (val === '' ? null : val),
      z.number().min(0).max(100).nullable()
    ),

    bmi: z.number().optional(),

    painScale: z.number().int().min(0).max(10).optional(),

    notes: z.string().optional(),

    triageLevel: TRIAGE_LEVEL_ENUM.optional(),
    consciousnessLevel: CONSCIOUSNESS_LEVEL_ENUM.optional(),
    source: SOURCE_ENUM.optional(),

    // Units (optional but consistent with model defaults)
    temperatureUnit: TEMP_UNIT_ENUM.optional(),
    heightUnit: HEIGHT_UNIT_ENUM.optional(),
    weightUnit: WEIGHT_UNIT_ENUM.optional()
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
    weightKg: z.number().positive().optional(), 
    heightCm: z.number().positive().optional(), 
    notes: z.string().optional(),
    triageLevel: TRIAGE_LEVEL_ENUM.optional(),
    consciousnessLevel: CONSCIOUSNESS_LEVEL_ENUM.optional(),
    source: SOURCE_ENUM.optional(),

    // Units (optional but consistent with model defaults)
    temperatureUnit: TEMP_UNIT_ENUM.optional(),
    heightUnit: HEIGHT_UNIT_ENUM.optional(),
    weightUnit: WEIGHT_UNIT_ENUM.optional(),
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
