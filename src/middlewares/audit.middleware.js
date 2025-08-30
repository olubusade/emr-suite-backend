// src/middleware/audit.middleware.js
const { logAudit } = require('../services/audit.service');

// Infer action from HTTP method for auto-logging
function inferAction(method) {
  switch (method) {
    case 'POST': return 'CREATE';
    case 'PUT':
    case 'PATCH': return 'UPDATE';
    case 'DELETE': return 'DELETE';
    case 'GET': return 'VIEW';
    default: return 'UNKNOWN';
  }
}

/**
 * Controller helper – call this inside controllers when you want a custom action.
 * Sets a flag so route-level auto audit won't duplicate the entry.
 */
async function attachAudit(req, action, resource, resourceId = null, metadata = {}) {
  try {
    await logAudit({
      userId: req.user?.id || null,
      action,
      resource,
      resourceId,
      metadata: {
        ip: req.ip,
        ua: req.headers['user-agent'] || '',
        ...metadata
      }
    });
    // Prevent auto middleware from logging a duplicate for this request
    req._skipAutoAudit = true;
  } catch (err) {
    console.error('attachAudit failed:', err);
  }
}

/**
 * Route middleware – auto audit based on HTTP method.
 * Safe with attachAudit(): will skip if controller already logged.
 */
function auditTrail(resource) {
  return (req, res, next) => {
    const action = inferAction(req.method);
    const userId = req.user?.id || null;

    const oldJson = res.json;
    res.json = async function (body) {
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
        console.error('Audit auto-log failed:', err);
      }
      return oldJson.call(this, body);
    };

    next();
  };
}

module.exports = { auditTrail, attachAudit };
