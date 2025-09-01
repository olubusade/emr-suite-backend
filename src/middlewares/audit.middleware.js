import { logAudit } from '../services/audit.service.js';

/**
 * Infer default action based on HTTP method
 */
function inferAction(method) {
  switch (method.toUpperCase()) {
    case 'POST': return 'CREATE';
    case 'PUT':
    case 'PATCH': return 'UPDATE';
    case 'DELETE': return 'DELETE';
    case 'GET': return 'VIEW';
    default: return 'UNKNOWN';
  }
}

/**
 * Attach a custom audit entry from controller
 * Prevents auto middleware from duplicating the audit.
 * @param {object} req - Express request object
 * @param {string} action - Action name (e.g., CREATE, UPDATE)
 * @param {string} resource - Resource name (e.g., 'user', 'bill')
 * @param {string|number|null} resourceId - ID of the resource
 * @param {object} metadata - Additional info to log
 */
export async function attachAudit(req, action, resource, resourceId = null, metadata = {}) {
  try {
    await logAudit({
      userId: req.user?.id || null,
      action,
      resource,
      resourceId,
      metadata: {
        ip: req.ip,
        userAgent: req.headers['user-agent'] || '',
        ...metadata
      }
    });

    // Flag to skip auto audit for this request
    req._skipAutoAudit = true;
  } catch (err) {
    console.error('attachAudit failed:', err);
  }
}

/**
 * Route-level middleware to automatically log audit entries
 * Based on HTTP method and resource name
 * Skips logging if attachAudit() was called in controller
 * @param {string} resource - Name of the resource (e.g., 'user', 'bill')
 */
export function auditTrail(resource) {
  return (req, res, next) => {
    const action = inferAction(req.method);
    const userId = req.user?.id || null;

    // Intercept res.json to log after response data is ready
    const originalJson = res.json.bind(res);
    res.json = async (body) => {
      try {
        if (!req._skipAutoAudit) {
          await logAudit({
            userId,
            action,
            resource,
            resourceId: req.params?.id || null,
            metadata: {
              query: req.query,
              body: req.body,
              result: body
            }
          });
        }
      } catch (err) {
        console.error('Auto audit log failed:', err);
      }
      return originalJson(body);
    };

    next();
  };
}
