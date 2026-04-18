import { z, uuid } from '../core.js';



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
