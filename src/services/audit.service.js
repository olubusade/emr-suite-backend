import { AuditLog, User } from '../models/index.js';

/**
 * Low-level audit log creator
 * Used by middleware and controllers
 */
export async function logAudit({ userId, action, entity, entityId = null, ip, userAgent, details = {} }) {

  try {
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
    console.error('Audit log error:', err.message);
  }
}

/**
 * List audit logs with filters & pagination
 * @param {object} params
 * @param {number} params.page - Current page
 * @param {number} params.pageSize - Items per page
 * @param {object} params.filters - Optional filters { userId, action, entity }
 */
export async function listAuditLogs({ page = 1, pageSize = 50, filters = {} }) {
  const limit = Math.min(Number(pageSize) || 50, 1000);
  const offset = (Math.max(Number(page) || 1, 1) - 1) * limit;

  const where = {};
  if (filters.userId) where.userId = filters.userId;
  if (filters.action) where.action = filters.action;
  if (filters.entity) where.entity = filters.entity;

  const { count, rows } = await AuditLog.findAndCountAll({
    where,
    include: [
      { model: User, attributes: ['id', 'email', 'fullName'] }
    ],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  return {
    count,
    rows,
    page: Math.max(Number(page) || 1, 1),
    pageSize: limit,
    pages: Math.ceil(count / limit),
  };
}