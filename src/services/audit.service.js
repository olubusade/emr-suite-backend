const { AuditLog, User } = require('../models');

/**
 * Low-level creator used by middleware and controllers.
 */
async function logAudit({ userId, action, resource, resourceId = null, metadata = {} }) {
  try {
    await AuditLog.create({ userId, action, resource, resourceId, metadata });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
}

/**
 * List audit logs with filters & pagination
 */
async function listAuditLogs({ page = 1, pageSize = 50, filters = {} }) {
  const limit = pageSize;
  const offset = (page - 1) * pageSize;

  const where = {};
  if (filters.userId) where.userId = filters.userId;
  if (filters.action) where.action = filters.action;
  if (filters.resource) where.resource = filters.resource;

  const { count, rows } = await AuditLog.findAndCountAll({
    where,
    include: [{ model: User, attributes: ['id', 'email', 'full_name'] }],
    order: [['createdAt', 'DESC']], // adjust if your model uses underscored timestamps
    limit,
    offset
  });

  return { count, rows, page, pageSize, pages: Math.ceil(count / pageSize) };
}

module.exports = { logAudit, listAuditLogs };
