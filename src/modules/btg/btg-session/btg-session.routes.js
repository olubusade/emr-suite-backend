import express from 'express';
import { authRequired } from '../../../shared/middlewares/auth.middleware.js';
import { authorize } from '../../../shared/middlewares/permission.middleware.js';
import { asyncHandler } from '../../../shared/utils/asyncHandler.js';

import {
  registerViewer,
    getViewers,
  getActiveBTGSession
} from './btg-session.controller.js';

import { PERMISSIONS } from '../../../constants/index.js';
import { validate } from '../../../shared/utils/validation.js';
import {registerBTGSessionSchema, getBTGViewersSchema} from '../../../shared/validation/schemas/btg-session.schema.js'; 
import { btgHeartbeatLimiter } from '../../../shared/middlewares/rateLimit.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /btg-session/register:
 *   post:
 *     summary: Register active BTG viewer session (heartbeat)
 *     tags: [Break Glass Session]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [btgId, patientId]
 *             properties:
 *               btgId:
 *                 type: string
 *               patientId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Viewer registered successfully
 */
router.post(
  '/register',
    authRequired,
  btgHeartbeatLimiter,
  authorize(PERMISSIONS.CLINICAL_NOTE_READ),
  validate(registerBTGSessionSchema),
  asyncHandler(registerViewer)
);

/**
 * @swagger
 * /btg-session/{patientId}/viewers:
 *   get:
 *     summary: Get active BTG viewers for a patient
 *     tags: [Break Glass Session]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Active viewers retrieved
 */
router.get(
  '/:patientId/viewers',
  authRequired,
  authorize(PERMISSIONS.CLINICAL_NOTE_READ),
  validate(getBTGViewersSchema),
  asyncHandler(getViewers)
);
/**
 * @swagger
 * /btg-session/active:
 *   get:
 *     summary: Get active BTG session for patient
 *     tags: [Break Glass Session]
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
 *         description: Active BTG session retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BTGSessionResponse'
 */

router.get(
  '/active/:patientId',
  authRequired,
  authorize(PERMISSIONS.CLINICAL_NOTE_READ),
  asyncHandler(getActiveBTGSession)
);
export default router;