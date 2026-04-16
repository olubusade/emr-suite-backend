import { isoDateString, z, uuid } from '../core.js';
import { APPOINTMENT_STATUS_ENUM, APPOINTMENT_TIMEFRAME_ENUM, APPOINTMENT_TYPE_ENUM} from '../../validation/enums/appointment.enums.js';
import { SORT_DIRECTION_ENUM } from '../../validation/enums/filter-direction.enums.js';
export const createAppointmentSchema = z.object({
  body: z.object({
    patientId: uuid(),
    staffId: uuid(),
      appointmentDate: isoDateString(),    
    appointmentTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
    reason: z.string().max(255).optional(),
    notes: z.string().optional()
  })
});

export const updateAppointmentSchema = z.object({
  params: z.object({ id: uuid() }),
  body: z.object({
    appointmentDate: isoDateString().optional(),
    appointmentTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
    reason: z.string().max(255).optional(),
    notes: z.string().optional(),
    status: APPOINTMENT_STATUS_ENUM.optional(),
    type: APPOINTMENT_TYPE_ENUM.optional(),
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
