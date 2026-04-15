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
 * /audit:
 *   get:
 *     summary: Retrieve audit logs with filters and pagination
 *     description: |
 *       Returns a paginated list of audit logs.
 *       Supports filtering by user, entity, action, and date range.
 *
 *     tags: [Audits]
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 20
 *
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *
 *       - in: query
 *         name: entity
 *         schema:
 *           type: string
 *           example: patient
 *
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           example: USER_LOGIN
 *
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedAuditLogs'
 *
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 *       500:
 *         description: Internal server error
 */
router.get(
  '/',
  authRequired,
  authorize(PERMISSIONS.AUDIT_READ),
  validate(listAuditSchema),
  listAudits
);

export default router;