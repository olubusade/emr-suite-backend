import * as authService from './auth.service.js';
import { ok, error } from '../../shared/utils/response.js';
import { attachAudit } from '../../shared/middlewares/audit.middleware.js';
import { AUDIT_ACTIONS } from '../../constants/index.js';
import ApiError from '../../shared/utils/ApiError.js';
/**
 * AUTH CONTROLLER
 * Orchestrates the secure entry and exit points for the EMR suite.
 * Implements Token Rotation and Audit-on-Auth patterns.
 */

/**
 * User login
 * POST /api/v1/auth/login
 */
export async function login(req, res) {
  const { user, accessToken, refreshToken } = await authService.login({
    email: req.body.email,
    password: req.body.password,
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  });

  // attach user to request for audit
  req.user = user;

  await attachAudit(req, {
    action: AUDIT_ACTIONS.USER_LOGIN,
    entity: 'user',
    entityId: user.id,
    metadata: { email: user.email }
  });

  return ok(res, { user, accessToken, refreshToken }, 'Login successful');
}

/**
 * Refresh access token (Implements Token Rotation)
 * POST /api/v1/auth/refresh
 */
export async function refresh(req, res) {
  const { accessToken, refreshToken, user } = await authService.refreshToken(
    req.body.refreshToken,
    req.headers['user-agent'],
    req.ip
  );

  return ok(res, { user, accessToken, refreshToken }, 'Token refreshed');
}

/**
 * User logout
 * POST /api/v1/auth/logout
 */
export async function logout(req, res) {
  const userId = req.user?.id;
    
    if (!userId) {
      throw new ApiError(400, 'Missing user id');
    }
    
    // Revokes the refresh token in the database
    await authService.logout(userId, req.body.refreshToken);

    await attachAudit(req, {
      action: AUDIT_ACTIONS.USER_LOGOUT,
      entity: 'user',
      entityId: userId
    });

    return ok(res, { success: true }, 'Logged out successfully');
}

/**
 * Change user password
 * PUT /api/v1/auth/change-password
 */
export async function changePassword(req, res) {
  const userId = req.user.id;
  
  if (!userId) { 
    throw new ApiError(400, 'Missing user id');
  }
  
  await authService.changePassword(userId, req.body.oldPassword, req.body.newPassword);

  await attachAudit(req, {
    action: AUDIT_ACTIONS.PASSWORD_CHANGE,
    entity: 'user',
    entityId: userId
  });

  return ok(res, { success: true }, 'Password changed successfully');
}