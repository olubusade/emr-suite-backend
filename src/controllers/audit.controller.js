import * as auditService from '../services/audit.service.js';
import { ok, error } from '../utils/response.js';

/**
 * List audit logs
 * GET /api/audits
 */
export async function listAudits(req, res) {
  try {
    const {
      page = 1,
      pageSize = 50,
      userId,
      action,
      entity,
    } = req.query;

    // Build filters object only with provided query params
    const filters = {};
    if (userId) filters.userId = userId; // JS camelCase; service handles conversion to snake_case
    if (action) filters.action = action;
    if (entity) filters.entity = entity;

    const result = await auditService.listAuditLogs({
      page: Number(page),
      pageSize: Number(pageSize),
      filters,
    });

    // Map DB snake_case to camelCase for JS response
    const rows = result.rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      action: row.action,
      entity: row.entity,
      entityId: row.entityId,
      metadata: row.metadata,
      createdAt: row.createdAt,
    }));

    return ok(
      res,
      rows,
      'Audit logs retrieved successfully',
      {
        total: result.count,
        page: result.page,
        pageSize: result.pageSize,
        pages: Math.ceil(result.count / result.pageSize),
      }
    );
  } catch (err) {
    console.error('audit.listAudits', err);
    return error(res, 500, err.message || 'Failed to fetch audit logs');
  }
}
