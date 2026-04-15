import express from 'express';
import { listAudits } from './audit.controller.js';
import { authRequired } from '../../shared/middlewares/auth.middleware.js';
import { authorize } from '../../shared/middlewares/permission.middleware.js';
import { validate } from '../../shared/utils/validation.js';
import { listAuditSchema } from '../../shared/validation/schemas.js';
import { PERMISSIONS } from '../../constants/index.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Audits
 *   description: System audit logs for tracking all user activities and changes
 */

/**
 * @swagger
 * /audit:
 *   get:
 *     summary: Retrieve audit logs with filters and pagination
 *     description: |
 *       Returns a paginated list of audit logs. 
 *       Supports filtering by user, entity, action, and date range.
 *     tags: [Audits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 20
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter logs by user ID
 *       - in: query
 *         name: entity
 *         schema:
 *           type: string
 *           example: appointment
 *         description: Filter by entity type (appointment, patient, billing)
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           example: UPDATE_APPOINTMENT
 *         description: Filter by action performed
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for filtering logs
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for filtering logs
 *     responses:
 *       200:
 *         description: Paginated audit logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedAuditLogs'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.get(
  '/',
  authRequired,
  authorize(PERMISSIONS.AUDIT_READ),
  validate(listAuditSchema),
  listAudits
);

export default router;