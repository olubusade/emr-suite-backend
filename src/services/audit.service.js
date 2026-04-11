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
export async function logAudit({ userId, action, entity, entityId = null, ip, userAgent, details = {} }) {

  try {
    // We do not await this in a way that blocks clinical workflows
    // because an audit failure shouldn't stop a life-saving bill or other activities.
    await AuditLog.create({
      userId,
      action,
      entity,
      entityId,
      ipAddress: ip,
      userAgent,
      details
    });
  } catch (err) {
    /**
     * 🛡️ FAIL-SAFE:
     * If auditing fails, we MUST NOT throw the error. 
     * A database lock on the audit table should not stop a patient from being billed.
     */
    reportError(err, { 
      service: 'AuditService', 
      operation: 'logAudit',
      userId, 
      action 
    });

    logSecurityAlert('Audit trail persistence failed', { action, userId, entityId });
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
  const limit = Math.min(Number(pageSize) || 50, 100); // Guard: prevent memory exhaustion
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
          as: 'user', // Ensure this alias matches your model definition
          attributes: ['id', 'email', 'fullName'] 
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      items: rows,
      total: count,
      page: Math.max(Number(page) || 1, 1),
      pageSize: limit,
      pages: Math.ceil(count / limit),
    };
  } catch (err) {
    reportError(err, { service: 'AuditService', operation: 'listAuditLogs', filters });
    throw err; // In listing, we DO throw because the user is specifically requesting this data
  }
}