import { z } from 'zod';

export const APPOINTMENT_STATUS_ENUM = z.enum([
  "scheduled",
  "checked_in",
  "awaiting_vitals",
  "vitals_taken",
  "in_consultation",
  "completed",
  "canceled"
]);

export const APPOINTMENT_TYPE_ENUM = z.enum([
  "consultation",
  "follow_up",
  "emergency",
  "admission",
  "procedure"
]);

export const APPOINTMENT_TIMEFRAME_ENUM = z.enum([
  "PAST",
  "UPCOMING",
  "TODAY",
  "ALL"
]);