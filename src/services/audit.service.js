import { AuditLog, User } from '../models/index.js';
import { reportError, logSecurityAlert } from '../utils/monitoring.js';

/**
 * AUDIT SERVICE
 * The immutable record-keeper for the EMR.
 * Logs are "Append-Only" and provide a trail for compliance and security.
 */

/**
 * Low-level audit log creator
 * Designed to be "Fire and Forget" to avoid blocking the main event loop.
 */
export async function logAudit({
  userId,
  action,
  entity,
  entityId = null,
  ip,
  forwardedFor,
  userAgent,
  details = {}
}) {
  try {
    await AuditLog.create({
      userId,
      action,
      entity,
      entityId,
      ipAddress: ip,
      forwardedFor,
      userAgent,
      details
    });
  } catch (err) {
    reportError(err, {
      service: 'AuditService',
      operation: 'logAudit',
      userId,
      action
    });

    logSecurityAlert('Audit log failure', { action, userId });
  }
}

 /**
 * List audit logs with high-performance filtering
 * @param {object} params
 * @param {number} params.page - Current page
 * @param {number} params.pageSize - Items per page
 * @param {object} params.filters - Optional filters { userId, action, entity }
 */
export async function listAuditLogs({ page = 1, pageSize = 50, filters = {} }) {
  const limit = Math.min(Number(pageSize) || 50, 100);
  const offset = (Math.max(Number(page) || 1, 1) - 1) * limit;

  const where = {};
  if (filters.userId) where.userId = filters.userId;
  if (filters.action) where.action = filters.action;
  if (filters.entity) where.entity = filters.entity;

  try {
    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'actor',
          attributes: ['id', 'email', 'fullName']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return {
      items: rows,
      count,
      page,
      pageSize: limit
    };
  } catch (err) {
    reportError(err, { service: 'AuditService', operation: 'listAuditLogs' });
    throw err;
  }
}