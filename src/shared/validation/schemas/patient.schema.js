import { isoDateString, z, uuid, phoneRegex } from '../core.js';
import { MARITAL_ENUM,GENDER_ENUM,BLOOD_ENUM,GENOTYPE_ENUM} from '../../validation/enums/patient.enums.js';

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
    maritalStatus: MARITAL_ENUM.default('single'),
    
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
  body: createPatientSchema.shape.body.partial(),
});

export const getPatientSchema = z.object({
  params: z.object({ id: uuid() })
});

export const deletePatientSchema = z.object({
  params: z.object({ id: uuid() })
});