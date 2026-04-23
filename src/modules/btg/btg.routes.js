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
  rejectBTG
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
 * /btg/active:
 *   get:
 *     summary: Get active Break Glass access for a patient
 *     tags: [Break Glass]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
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
  '/active',
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
 *             $ref: '#/components/schemas/BreakGlassApprove'
 *     responses:
 *       200:
 *         description: BTG request approved successfully
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.put(
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
 *     responses:
 *       200:
 *         description: BTG rejected successfully
 */
router.put('/:id/reject', authRequired,
  authorize(PERMISSIONS.BREAK_GLASS_REJECT),
  validate(breakGlassApproveSchema),
  asyncHandler(rejectBTG));
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
 *     responses:
 *       200:
 *         description: BTG expired successfully
 */
router.put('/:id/expire', authRequired,
  authorize(PERMISSIONS.BREAK_GLASS_EXPIRE),
  validate(breakGlassApproveSchema),
  asyncHandler(expireBTG));

export default router;