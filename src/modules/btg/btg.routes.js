import express from 'express';
import { authRequired } from '../../shared/middlewares/auth.middleware.js';
import { authorize } from '../../shared/middlewares/permission.middleware.js';
import { validate } from '../../shared/utils/validation.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

import {
  breakGlassRequestSchema,
  breakGlassApproveSchema,
  breakGlassReadSchema,
  getActiveBTGSchema
} from '../../shared/validation/schemas/btg.schema.js';

import {
  requestBTG,
  approveBTG,
  getActiveBTG,
  listBTGRequests,
  expireBTG,
  rejectBTG,
  revokeBTG
} from './btg.controller.js';

import { PERMISSIONS } from '../../constants/index.js';

const router = express.Router();


/**
 * @swagger
 * /btg/request:
 *   post:
 *     summary: Nurse requests Break-The-Glass emergency access
 *     tags: [Break Glass]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BreakGlassRequest'
 *     responses:
 *       200:
 *         description: BTG request submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BreakGlassResponse'
 */
router.post(
  '/request',
  authRequired,
  authorize(PERMISSIONS.BREAK_GLASS_REQUEST),
  validate(breakGlassRequestSchema),
  asyncHandler(requestBTG)
);

/**
 * @swagger
 * /btg/:patientId/active:
 *   get:
 *     summary: Get active Break Glass access for a patient
 *     tags: [Break Glass]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Active BTG retrieved successfully
 */

router.get(
  '/:patientId/active',
  authRequired,
  authorize([
    PERMISSIONS.BREAK_GLASS_REQUEST,
    PERMISSIONS.BREAK_GLASS_READ,
    PERMISSIONS.CLINICAL_NOTE_READ
  ]),
  validate(getActiveBTGSchema),
  asyncHandler(getActiveBTG)
);

// =========================
// ADMIN ROUTES
// =========================

/**
 * @swagger
 * /btg:
 *   get:
 *     summary: List all BTG requests
 *     tags: [Break Glass]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List retrieved successfully
 */
router.get(
  '/',
  authRequired,
  authorize(PERMISSIONS.BREAK_GLASS_READ),
  validate(breakGlassReadSchema),
  asyncHandler(listBTGRequests)
);


/**
 * @swagger
 * /btg/{id}/approve:
 *   put:
 *     summary: Approve a Break-The-Glass emergency access request
 *     tags: [Break Glass]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - decisionReason
 *             properties:
 *               decisionReason:
 *                 type: string
 *                 minLength: 5
 *                 example: Access no longer clinically required
 *     responses:
 *       200:
 *         description: BTG expired successfully
 *  
 *       400:
 *         description: Validation error
 *
 *       403:
 *         description: Unauthorized or insufficient permission
 *
 *       404:
 *         description: BTG request not found
 */
router.patch(
  '/:id/approve',
  authRequired,
  authorize(PERMISSIONS.BREAK_GLASS_APPROVE),
  validate(breakGlassApproveSchema),
  asyncHandler(approveBTG)
);
/**
 * @swagger
 * /btg/{id}/reject:
 *   put:
 *     summary: Reject BTG request
 *     tags: [Break Glass]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - decisionReason
 *             properties:
 *               decisionReason:
 *                 type: string
 *                 minLength: 5
 *                 example: Access no longer clinically required
 *     responses:
 *       200:
 *         description: BTG rejected successfully
 *  
 *       400:
 *         description: Validation error
 *
 *       403:
 *         description: Unauthorized or insufficient permission
 *
 *       404:
 *         description: BTG request not found
 */
router.patch('/:id/reject', authRequired,
  authorize(PERMISSIONS.BREAK_GLASS_REJECT),
  validate(breakGlassApproveSchema),
  asyncHandler(rejectBTG));

/**
 * @swagger
 * /btg/{id}/revoke:
 *   put:
 *     summary: Revoke Active Clinical Note Access
 *     tags: [Break Glass]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - decisionReason
 *             properties:
 *               decisionReason:
 *                 type: string
 *                 minLength: 5
 *                 example: Access no longer clinically required
 *     responses:
 *       200:
 *         description: BTG revoked successfully
 *  
 *       400:
 *         description: Validation error
 *
 *       403:
 *         description: Unauthorized or insufficient permission
 *
 *       404:
 *         description: BTG request not found
 */
router.patch('/:id/revoke', authRequired,
  authorize(PERMISSIONS.BREAK_GLASS_REVOKE),
  validate(breakGlassApproveSchema),
  asyncHandler(revokeBTG));
/**
 * @swagger
 * /btg/{id}/expire:
 *   put:
 *     summary: Expire BTG access
 *     tags: [Break Glass]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - decisionReason
 *             properties:
 *               decisionReason:
 *                 type: string
 *                 minLength: 5
 *                 example: Access no longer clinically required
 *     responses:
 *       200:
 *         description: BTG expired successfully
 *  
 *       400:
 *         description: Validation error
 *
 *       403:
 *         description: Unauthorized or insufficient permission
 *
 *       404:
 *         description: BTG request not found
 */
router.patch('/:id/expire', authRequired,
  authorize(PERMISSIONS.BREAK_GLASS_EXPIRE),
  validate(breakGlassApproveSchema),
  asyncHandler(expireBTG));

export default router;