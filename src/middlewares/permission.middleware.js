import ApiError from '../utils/ApiError.js';
import * as rbacService from '../services/rbac.service.js';
import { logAudit } from '../services/audit.service.js';

/**
 * Middleware to authorize user based on a specific permission key
 * @param {string} permissionKey - The permission required to access the route
 */
export function authorize(permissionKey) {
  return async (req, res, next) => {
    try {
      if (!req.user) throw new ApiError(401, 'Unauthorized');

      const hasPermission = await rbacService.userHasPermission(req.user.id, permissionKey);

      if (!hasPermission) {
        await logAudit({
          userId: req.user.id,
          action: 'ACCESS_DENIED',
          resource: permissionKey,
          status: 'FAILED',
          metadata: {
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] || '',
            route: req.originalUrl,
            method: req.method
          }
        });

        throw new ApiError(403, 'Forbidden: insufficient permissions');
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
