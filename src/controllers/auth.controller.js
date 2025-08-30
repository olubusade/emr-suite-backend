import * as authService from '../services/auth.service.js';
import { ok, error } from '../utils/response.js';
import { attachAudit } from '../middlewares/audit.middleware.js';

export async function login(req, res) {
  try {
    const { user, accessToken, refreshToken, permissions } = await authService.login({
      email: req.body.email,
      password: req.body.password,
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });

    await attachAudit(req, 'LOGIN', 'user', user.id, { email: user.email });

    return ok(res, {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.Role?.name,
        permissions
      },
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error('auth.login', err);
    return error(res, err.statusCode || 500, err.message || 'Server error');
  }
}

export async function refresh(req, res) {
  try {
    const { accessToken, refreshToken, permissions, user } = await authService.refreshToken(
      req.body.refreshToken,
      req.headers['user-agent'],
      req.ip
    );
    return ok(res, { accessToken, refreshToken, user: { ...user, permissions } });
  } catch (err) {
    console.error('auth.refresh', err);
    return error(res, err.statusCode || 500, err.message || 'Server error');
  }
}

export async function logout(req, res) {
  try {
    await authService.logout(req.user?.id, req.body.refreshToken);
    await attachAudit(req, 'LOGOUT', 'user', req.user?.id);
    return ok(res, { success: true }, 'Logged out successfully');
  } catch (err) {
    console.error('auth.logout', err);
    return error(res, err.statusCode || 500, err.message || 'Server error');
  }
}

export async function changePassword(req, res) {
  try {
    await authService.changePassword(req.user.id, req.body.oldPassword, req.body.newPassword);
    await attachAudit(req, 'CHANGE_PASSWORD', 'user', req.user.id);
    return ok(res, { success: true }, 'Password changed successfully');
  } catch (err) {
    console.error('auth.changePassword', err);
    return error(res, err.statusCode || 500, err.message || 'Server error');
  }
}
