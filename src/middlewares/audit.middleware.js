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

export async function attachAudit(req, { action, entity, entityId = null, metadata = {} }) {  
  try {
    const userId = req.user?.id || entityId;
    await logAudit({
      userId,
      action,
      entity,
      entityId,
      ip: req.ip,
      userAgent: req.headers['user-agent'] || '',
      details: metadata
    });

    req._skipAutoAudit = true; //this prevents auditing for actions I manually log
  } catch (err) {
    console.error('attachAudit failed:', err);
  }
}


export function auditTrail(entity) {
  return (req, res, next) => {
    const action = inferAction(req.method);
    const userId = req.user?.id || null;

    const originalJson = res.json.bind(res);
    res.json = async (body) => {
      try {
        // Only log if not skipped
        if (!req._skipAutoAudit) {
          await logAudit({
            userId,
            action,
            entity,
            entityId: req.params?.id || null,
            ip: req.ip,
            userAgent: req.headers['user-agent'] || '',
            details: {
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
