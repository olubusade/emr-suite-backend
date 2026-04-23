import { AuditLog } from '../../config/associations.js';

export async function getAuditEventsFHIR(req, res) {
  const logs = await AuditLog.findAll({
    limit: 100,
    order: [['createdAt', 'DESC']]
  });

  return res.json({
    resourceType: "Bundle",
    entry: logs.map(l => ({
      resourceType: "AuditEvent",
      id: l.id,
      action: l.action,
      userId: l.userId,
      entity: l.entity,
      timestamp: l.createdAt
    }))
  });
}