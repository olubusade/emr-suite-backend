import express from 'express';
import * as metricsController from './metrics.controller.js';
import { authRequired } from '../../shared/middlewares/auth.middleware.js';
import { authorize } from '../../shared/middlewares/permission.middleware.js';
import { PERMISSIONS } from '../../constants/index.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Metrics
 *   description: EMR system analytics and operational dashboard metrics
 */
/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Get EMR system metrics
 *     description: |
 *       Returns aggregated hospital KPIs including:
 *       - Patients & users count
 *       - Appointment statistics
 *       - Revenue insights
 *       - Clinical & nurse dashboards
 *       - Prometheus metrics
 *
 *     tags: [Metrics]
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           example: 12
 *         description: Number of months for patient trend analytics
 *
 *     responses:
 *       200:
 *         description: Metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MetricsResponse'
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
  authorize(PERMISSIONS.METRICS_READ),
  asyncHandler(metricsController.getMetrics)
);

export default router;