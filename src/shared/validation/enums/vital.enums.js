import { z } from 'zod';

export const TRIAGE_LEVEL_ENUM = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional();
export const CONSCIOUSNESS_LEVEL_ENUM = z.enum(['ALERT', 'VERBAL', 'PAIN', 'UNRESPONSIVE']);
export const SOURCE_ENUM = z.enum(['NURSE', 'DEVICE', 'MANUAL']);

export const TEMP_UNIT_ENUM = z.enum(['C', 'F']);
export const HEIGHT_UNIT_ENUM = z.enum(['cm', 'm', 'ft']);
export const WEIGHT_UNIT_ENUM = z.enum(['kg', 'lb']);

