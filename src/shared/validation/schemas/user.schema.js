import { z, uuid } from '../core.js';
import { GENDER_ENUM } from '../../validation/enums/patient.enums.js';
/**
 * =====================================================
 * STAFF CREATION (ADMIN)
 * =====================================================
 */

export const createStaffSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    designation: z.string().min(2).optional(),
    roleId: uuid(),
  }).strict()
});
/**
 * =====================================================
 * ROLE UPDATE (ASSIGN ROLE TO USER)
 * =====================================================
 */
export const updateRoleSchema = z.object({
  params: z.object({ id: uuid() }),
  body: z.object({ role: z.string().min(2) })
});
/**
 * =====================================================
 * PERMISSION ASSIGNMENT
 * =====================================================
 */
export const setPermissionSchema = z.object({
  params: z.object({ id: uuid() }),
  body: z.object({ permission: z.string(), enabled: z.boolean() })
});

/**
 * =====================================================
 * USER PROFILE UPDATE (/users/me)
 * =====================================================
 */
export const userUpdateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    phone: z.string().optional(),
    profileImage: z.string().url().optional(),
      gender: GENDER_ENUM.optional(),
     designation: z.string().min(2).max(100).optional()
  }).strict()
});

/**
 * =====================================================
 * ADMIN CREATE USER
 * =====================================================
 */
export const userCreateSchema = z.object({
  body: z.object({
    email: z.string().email(),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
      phone: z.string().optional(),
     designation: z.string().min(2).max(100).optional(),
    // system assignment
    roleId: uuid(),

    gender: GENDER_ENUM.optional(),
  }).strict()
});

/**
 * =====================================================
 * ADMIN UPDATE USER
 * =====================================================
 */
export const userUpdateSchema = z.object({
  params: z.object({
    id: uuid(),
  }),

  body: z.object({
    email: z.string().email().optional(),
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    phone: z.string().optional(),
    roleId: uuid().optional(),
    gender: GENDER_ENUM.optional(),
    profileImage: z.string().url().optional(),
    designation: z.string().min(2).max(100).optional()
  }).strict()
});

/**
 * =====================================================
 * UUID PARAM VALIDATION (REUSABLE)
 * =====================================================
 */
export const uuidParamSchema = z.object({
  params: z.object({
    id: uuid(),
  })
});