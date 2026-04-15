import * as auditService from './audit.service.js';
import { ok, error } from '../../shared/utils/response.js';

/**
 * AUDIT CONTROLLER
 * Provides transparency into system activities for compliance officers.
 * Handles the mapping between the flat persistence layer and the structured API response.
 */

/**
 * List audit logs with multi-dimensional filtering
 * GET /api/v1/audits
 */
export async function listAudits(req, res) {
    
  try {
    const {
      page,
      pageSize,
      userId,
      action,
      entity,
      entityId
    } = req.query;

    const filters = {};
    if (userId) filters.userId = userId;
    if (action) filters.action = action;
    if (entity) filters.entity = entity;
    if (entityId) filters.entityId = entityId;
    
    const result = await auditService.listAuditLogs({
      page: Number(page),
      pageSize: Number(pageSize),
      filters
    });

    const rows = result.items.map(row => ({
      id: row.id,
      user: row.actor,
      action: row.action,
      entity: row.entity,
      entityId: row.entityId,
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      details: row.details,
      createdAt: row.createdAt
    }));

    return ok(res, rows, 'Audit logs retrieved successfully', {
      total: result.count,
      page: result.page,
      pageSize: result.pageSize,
      pages: Math.ceil(result.count / result.pageSize)
    });

  } catch (err) {
    return error(res, 500, err.message || 'Failed to fetch audit logs');
  }
}
