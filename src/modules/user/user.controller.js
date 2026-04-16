import * as userService from './user.service.js';
import { ok, created, fail, error } from '../../shared/utils/response.js';
import { attachAudit } from '../../shared/middlewares/audit.middleware.js';
/**
 * USER CONTROLLER
 * Manages identity lifecycle for hospital staff.
 * Distinguishes between self-service (profile) and administrative (staff management) actions.
 */

/**
 * Register a new staff member (Admin-led or self-reg depending on flow)
 */
export async function registerUser(req, res) {
  
  const user = await userService.createUser(req.body);

    await attachAudit(req, { 
          action: 'USER_REGISTER', 
          entity: 'user', 
          entityId: user.id, 
          metadata: { email: user.email, role: user.roleName} 
      });
  return created(res, {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.roleName,
  }, 'User registered successfully');
  
}

/**
 * Get profile of the currently authenticated user
 */
export async function getProfile(req, res) {
  
  const user = await userService.getUserProfile(req.user.id);
  if (!user) return fail(res, 'User not found', 404);

  return ok(res, {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.roleName,
    active: user.active
  });
  
}

/**
 * Self-service: Update own profile details
 */
export async function updateProfile(req, res) {
  
  const user = await userService.updateUserProfile(req.user.id, req.body);
  
  await attachAudit(req, { 
          action: 'PROFILE_SELF_UPDATE', 
          entity: 'user', 
          entityId: user.id, 
          metadata: { updatedFields: Object.keys(req.body) }
      });
  return ok(res, {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.roleName,
  }, 'Profile updated successfully');
}

/**
 * Admin: List all hospital staff with pagination
 */
export async function listStaff(req, res) {
  
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.pageSize, 10) || 20;

  const data = await userService.listStaff({ ...req.query, page, pageSize });

  const items = data.items.map(user => ({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    fName: user.fName,
    lName: user.lName,
    role: user.designation,
    active:user.active,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));

  return ok(res, items, 'Users retrieved successfully', {
    page: data.page,
    pages: data.pages,
    total: data.total,
  });
}

/**
 * Admin: Force update a user account (e.g., changing roles or deactivating)
 */
export async function updateUser(req, res) {
  
  const user = await userService.updateUser(req.params.id, req.body);

  await attachAudit(req, { 
          action: 'ADMIN_USER_UPDATE', 
          entity: 'user', 
          entityId: user.id, 
          metadata: { adminId: req.user.id, changes: req.body }
      });
  return ok(res, {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.roleName,
  }, 'User updated successfully');
}

/**
 * Admin: Remove a user (Soft delete or deactivation recommended in Service)
 */
export async function deleteUser(req, res) {
  
  userService.deleteUser(req.params.id);
  await attachAudit(req, { 
    action: 'ADMIN_USER_DELETE', 
    entity: 'user', 
    entityId: req.params.id, 
    metadata: { adminId: req.user.id} 
  });
  return ok(res, { success: true }, 'User deleted successfully');
}
