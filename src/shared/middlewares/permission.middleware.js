import ApiError from '../../shared/utils/ApiError.js';
import * as rbacService from '../../modules/role/rbac.service.js';
import { logAudit } from '../../modules/audit/audit.service.js';

/**
 * Middleware to authorize user based on a specific permission key
 * @param {string} permissionKey - The permission required to access the route
 */
export function authorize(permissionKey) {
  return async (req, res, next) => {
    try {
      if (!req.user) throw new ApiError(401, 'Unauthorized');

      // Normalize to array (this is the ONLY change)
      const permissions = Array.isArray(permissionKey)
        ? permissionKey
        : [permissionKey];

      // ANY permission passes (backward compatible behavior)
      const checks = await Promise.all(
        permissions.map(p =>
          rbacService.userHasPermission(req.user.id, p)
        )
      );

      const hasPermission = checks.some(Boolean);

      if (!hasPermission) {
        await logAudit({
          userId: req.user.id,
          action: 'ACCESS_DENIED',
          resource: permissions.join(','), // handles both cases
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
