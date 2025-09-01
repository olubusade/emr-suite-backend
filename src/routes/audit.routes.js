import express from 'express';
import { listAudits } from '../controllers/audit.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/permission.middleware.js';
import { validate } from '../utils/validation.js';
import { listAuditSchema } from '../validation/schemas.js';
import { PERMISSIONS } from '../constants/index.js';

const router = express.Router();

/**
 * @swagger
 * /audits:
 *   get:
 *     summary: List all audit logs
 *     tags: [Audits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filter audits by specific user ID
 *     responses:
 *       200:
 *         description: List of audit logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AuditLog'
 *                 page:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *                 total:
 *                   type: integer
 *       403:
 *         description: Forbidden - insufficient permissions
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authRequired,
  authorize(PERMISSIONS.AUDIT_READ),
  validate(listAuditSchema),
  listAudits
);

export default router;
