import * as auditService from '../services/audit.service.js';
import { ok, error } from '../utils/response.js';

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
      page = 1,
      pageSize = 50,
      userId,
      action,
      entity,
      entityId
    } = req.query;

    // Filter construction - Only passing defined values to the Service
    const filters = {};
    if (userId) filters.userId = userId; 
    if (action) filters.action = action;
    if (entity) filters.entity = entity;
    if (entityId) filters.entityId = entityId;

    const result = await auditService.listAuditLogs({
      page: Number(page),
      pageSize: Number(pageSize),
      filters,
    });

    /**
     * DTO MAPPING (Data Transfer Object)
     * Ensuring the API response matches our frontend's expectations 
     * and hides internal DB specifics if necessary.
     */
    const rows = result.rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      action: row.action,
      entity: row.entity,
      entityId: row.entityId,
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      details: row.details, // Structured JSONB data
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
    /**
     * Centralized error handling: We pass the error to our utility 
     * which handles the winston logging, keeping this controller lean.
     */
    return error(res, 500, err.message || 'Failed to fetch audit logs');
  }
}