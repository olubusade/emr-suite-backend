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
 * Extract real IP (proxy-safe)
 */
function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip
  );
}

/**
 * Manual audit trigger (recommended for critical actions)
 */
export async function attachAudit(req, {
  action,
  entity,
  entityId = null,
  before = null,
  after = null,
  metadata = {}
}) {
  try {
    const userId = req.user?.id || null;

    await logAudit({
      userId,
      action,
      entity,
      entityId,
      ip: getClientIp(req),
      forwardedFor: req.headers['x-forwarded-for'] || null,
      userAgent: req.headers['user-agent'] || '',
      details: {
        before,
        after,
        changedFields: before && after
          ? Object.keys(after).filter(key => before[key] !== after[key])
          : [],
        ...metadata
      }
    });

    req._skipAutoAudit = true;
  } catch (err) {
    console.error('attachAudit failed:', err);
  }
}

/**
 * Automatic audit middleware (fallback)
 */
export function auditTrail(entity) {
  return (req, res, next) => {
    const action = inferAction(req.method);
    const userId = req.user?.id || null;
    const ip = getClientIp(req);

    const originalJson = res.json.bind(res);

    res.json = async (body) => {
      try {
        if (!req._skipAutoAudit) {
          await logAudit({
            userId,
            action,
            entity,
            entityId: req.params?.id || null,
            ip,
            forwardedFor: req.headers['x-forwarded-for'] || null,
            userAgent: req.headers['user-agent'] || '',
            details: {
              query: req.query,
              body: req.body,
              responseStatus: body?.status || null
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