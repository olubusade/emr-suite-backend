import { isoDateString, z, uuid } from '../core.js';


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