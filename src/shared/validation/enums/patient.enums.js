import { z } from 'zod';
export const MARITAL_ENUM = z.enum(['single', 'married', 'divorced', 'widowed', 'separated']);

export const GENOTYPE_ENUM = z.enum(['AA', 'AS', 'SS', 'AC', 'SC']);

export const BLOOD_ENUM = z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);

export const GENDER_ENUM = z.enum(['male', 'female', 'other', 'unknown']);