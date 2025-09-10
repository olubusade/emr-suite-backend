import * as userService from '../services/user.service.js';
import { ok, created, fail, error } from '../utils/response.js';
import { attachAudit } from '../middlewares/audit.middleware.js';

/**
 * Register a new user
 */
export async function registerUser(req, res) {
  try {
    const user = await userService.createUser(req.body);

    await attachAudit(req, 'CREATE_USER', 'user', user.id, { email: user.email });

    return created(res, {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.roleName,
    }, 'User registered successfully');
  } catch (err) {
    console.error('user.registerUser', err);
    return error(res, err.statusCode || 500, err.message || 'Internal server error');
  }
}

/**
 * Get profile of logged-in user
 */
export async function getProfile(req, res) {
  try {
    const user = await userService.getUserProfile(req.user.id);
    if (!user) return fail(res, 'User not found', 404);

    return ok(res, {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.roleName,
    });
  } catch (err) {
    console.error('user.getProfile', err);
    return error(res, err.statusCode || 500, err.message || 'Unable to fetch profile');
  }
}

/**
 * Update profile of logged-in user
 */
export async function updateProfile(req, res) {
  try {
    const user = await userService.updateUserProfile(req.user.id, req.body);

    await attachAudit(req, 'UPDATE_PROFILE', 'user', user.id);

    return ok(res, {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.roleName,
    }, 'Profile updated successfully');
  } catch (err) {
    console.error('user.updateProfile', err);
    return error(res, err.statusCode || 500, err.message || 'Unable to update profile');
  }
}

/**
 * Admin: List all users
 */
export async function listUsers(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 20;

    const data = await userService.listUsers({ ...req.query, page, pageSize });

    const items = data.items.map(user => ({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.roleName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return ok(res, items, 'Users retrieved successfully', {
      page: data.page,
      pages: data.pages,
      total: data.total,
    });
  } catch (err) {
    console.error('user.listUsers', err);
    return error(res, err.statusCode || 500, err.message || 'Unable to list users');
  }
}

/**
 * Admin: Update user
 */
export async function updateUser(req, res) {
  try {
    const user = await userService.updateUser(req.params.id, req.body);

    await attachAudit(req, 'UPDATE_USER', 'user', user.id);

    return ok(res, {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.roleName,
    }, 'User updated successfully');
  } catch (err) {
    console.error('user.updateUser', err);
    return error(res, err.statusCode || 500, err.message || 'Unable to update user');
  }
}

/**
 * Admin: Delete user
 */
export async function deleteUser(req, res) {
  try {
    await userService.deleteUser(req.params.id);

    await attachAudit(req, 'DELETE_USER', 'user', req.params.id);

    return ok(res, { success: true }, 'User deleted successfully');
  } catch (err) {
    console.error('user.deleteUser', err);
    return error(res, err.statusCode || 500, err.message || 'Unable to delete user');
  }
}
