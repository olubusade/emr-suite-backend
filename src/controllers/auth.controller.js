import * as authService from '../services/auth.service.js';
import { ok, error } from '../utils/response.js';
import { attachAudit } from '../middlewares/audit.middleware.js';

/**
 * User login
 */
export async function login(req, res) {
  try {
    const { user, accessToken, refreshToken } = await authService.login({
      email: req.body.email,
      password: req.body.password,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });
    
    await attachAudit(req, {
      action: 'LOGIN',
      entity: 'user',
      entityId: user.id,
      metadata: { email: user.email }
    });

    return ok(res, { user, accessToken, refreshToken });
  } catch (err) {
    console.error('auth.login', err);
    return error(res, err.statusCode || 500, err.message || 'Server error');
  }
}

/**
 * Refresh access token
 */
export async function refresh(req, res) {
  try {
    const { accessToken, refreshToken, user } = await authService.refreshToken(
      req.body.refreshToken,
      req.headers['user-agent'],
      req.ip
    );

    return ok(res, { user, accessToken, refreshToken });
  } catch (err) {
    console.error('auth.refresh', err);
    return error(res, err.statusCode || 500, err.message || 'Server error');
  }
}

/**
 * User logout
 */
export async function logout(req, res) {
  try {
    const userId = req.user?.id;
    
    
    await authService.logout(userId, req.body.refreshToken);

    await attachAudit(req, {
      action: 'LOGOUT',
      entity: 'user',
      entityId: userId,
    });

    return ok(res, { success: true }, 'Logged out successfully');
  } catch (err) {
    console.error('auth.logout', err);
    return error(res, err.statusCode || 500, err.message || 'Server error');
  }
}

/**
 * Change user password
 */
export async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    await authService.changePassword(userId, req.body.oldPassword, req.body.newPassword);

    await attachAudit(req, {
      action: 'CHANGE_PASSWORD',
      entity: 'user',
      entityId: userId,
    });

    return ok(res, { success: true }, 'Password changed successfully');
  } catch (err) {
    console.error('auth.changePassword', err);
    return error(res, err.statusCode || 500, err.message || 'Server error');
  }
}
