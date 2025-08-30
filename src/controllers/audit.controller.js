import * as auditService from '../services/audit.service.js';
import { ok, error } from '../utils/response.js';

/**
 * List audit logs
 * GET /api/audits
 */
export async function listAudits(req, res) {
  try {
    const { page = 1, pageSize = 50, userId, action, entity } = req.query;

    const result = await auditService.listAuditLogs({
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
      filters: { userId, action, entity }
    });

    return ok(res, result.rows, 'Audit logs retrieved successfully', {
      total: result.count,
      page: result.page,
      pageSize: result.pageSize,
      pages: Math.ceil(result.count / result.pageSize)
    });
  } catch (err) {
    console.error('audit.listAudits', err);
    return error(res, 500, err.message || 'Failed to fetch audit logs');
  }
}
