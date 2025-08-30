import { verifyAccess } from '../utils/jwt.js';
import { fail } from '../utils/response.js';

export function authOptional(req, _res, next) {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return next();
    try {
        req.user = verifyAccess(token);
    } catch { /* ignore */ }
    next();
}

export function authRequired(req, res, next) {
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    if (!token) return fail(res, 401, 'Authentication required');
    try {
      const payload = verifyAccess(token);
      req.user = payload; // { id, email, roleId, permissions }
      next();
    } catch {
      return fail(res, 401, 'Invalid or expired token');
    }
  }