import * as userService from '../services/user.service.js';
import { ok, created, fail, error } from '../utils/response.js';
import { attachAudit } from '../middlewares/audit.middleware.js';

export async function registerUser(req, res) {
  try {
    const user = await userService.createUser(req.body);
    await attachAudit(req, 'CREATE_USER', 'user', user.id, { email: user.email });
    return created(res, { id: user.id, email: user.email, name: user.full_name });
  } catch (err) {
    console.error('user.registerUser', err);
    return error(res, err.statusCode || 500, err.message || 'Internal server error');
  }
}

export async function getProfile(req, res) {
  try {
    const user = await userService.getUserProfile(req.user.id);
    if (!user) return fail(res, 'User not found', 404);
    return ok(res, user);
  } catch (err) {
    console.error('user.getProfile', err);
    return error(res, err.statusCode || 500, err.message || 'Unable to fetch profile');
  }
}

export async function updateProfile(req, res) {
  try {
    const user = await userService.updateUserProfile(req.user.id, req.body);
    await attachAudit(req, 'UPDATE_PROFILE', 'user', user.id);
    return ok(res, { id: user.id, email: user.email, name: user.full_name });
  } catch (err) {
    console.error('user.updateProfile', err);
    return error(res, err.statusCode || 500, err.message || 'Unable to update profile');
  }
}

// Admin
export async function listUsers(req, res) {
  try {
    const data = await userService.listUsers(req.query);
    return ok(res, data.items, 'Users retrieved', { page: data.page, pages: data.pages, total: data.total });
  } catch (err) {
    console.error('user.listUsers', err);
    return error(res, err.statusCode || 500, err.message || 'Unable to list users');
  }
}
