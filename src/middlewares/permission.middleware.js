// middleware/permission.js
const ApiError = require('../utils/ApiError');
const rbacService = require('../services/rbac.service');
const AuditService = require('../services/audit.service');

function authorize(permissionKey) {
  return async (req, res, next) => {
    try {
      if (!req.user) throw new ApiError(401, 'Unauthorized');

      const hasPermission = await rbacService.userHasPermission(req.user.id, permissionKey);

      if (!hasPermission) {
        await AuditService.log({
          userId: req.user.id,
          action: "ACCESS_DENIED",
          resource: permissionKey,
          status: "FAILED",
          ipAddress: req.ip,
        });
        throw new ApiError(403, 'Forbidden: insufficient permissions');
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { authorize };
