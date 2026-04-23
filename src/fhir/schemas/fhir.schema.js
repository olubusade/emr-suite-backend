import { z } from 'zod';

// ================= PATIENT =================
export const FHIRPatientRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid patient id')
  })
});

export const FHIRPatientResponseSchema = z.object({
  resourceType: z.literal('Patient'),
  id: z.string().uuid(),

  name: z.array(
    z.object({
      text: z.string()
    })
  ),

  gender: z.string().optional(),

  birthDate: z.string().optional()
});
// ================= OBSERVATION =================
export const FHIRObservationRequestSchema = z.object({
  query: z.object({
    patient: z.string().uuid('Invalid patient id')
  })
});

export const FHIRObservationResponseSchema = z.object({
  resourceType: z.literal('Observation'),
  id: z.string().uuid(),
  status: z.string(),

  subject: z.object({
    reference: z.string()
  }),

  valueQuantity: z
    .object({
      value: z.number(),
      unit: z.string()
    })
    .optional()
});

// ================= CONDITION =================
export const FHIRConditionRequestSchema = z.object({
  query: z.object({
    patient: z.string().uuid('Invalid patient id')
  })
});

export const FHIRConditionResponseSchema = z.object({
  resourceType: z.literal('Condition'),
  id: z.string().uuid(),

  clinicalStatus: z.object({
    text: z.string()
  }),

  subject: z.object({
    reference: z.string()
  }),

  recordedDate: z.string()
});

// ================= CLINICAL NOTES QUERY =================
export const FHIRClinicalNoteRequestSchema = z.object({
  query: z.object({
    patient: z.string().uuid(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional()
  })
});

export const FHIRClinicalNoteResponseSchema = z.object({
  resourceType: z.literal('Composition'),
  id: z.string().uuid(),

  status: z.string(),

  subject: z.object({
    reference: z.string()
  }),

  author: z.array(
    z.object({
      display: z.string()
    })
  ),

  date: z.string(),

  title: z.string()
});

// ================= AUDIT EVENT =================
export const FHIRAuditEventRequestSchema = z.object({
  query: z.object({
    userId: z.string().uuid().optional()
  })
});

export const FHIRAuditEventResponseSchema = z.object({
  resourceType: z.literal('AuditEvent'),
  id: z.string().uuid(),

  action: z.string(),

  recorded: z.string(),

  agent: z.array(
    z.object({
      who: z.object({
        reference: z.string()
      })
    })
  )
});