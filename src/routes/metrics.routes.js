import express from 'express';
import * as metricsController from '../controllers/metrics.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/permission.middleware.js';
import { PERMISSIONS } from '../constants/index.js';

const r = express.Router();

/**
 * @swagger
 * tags:
 *   name: Metrics
 *   description: API endpoints to retrieve various system metrics
 */

/**
 * @swagger
 * /api/metrics:
 *   get:
 *     summary: Get system and EMR metrics
 *     description: Returns patient counts, revenue, monthly trend, and Prometheus metrics.
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patientCount:
 *                   type: integer
 *                   example: 120
 *                 revenue:
 *                   type: number
 *                   format: float
 *                   example: 12500.50
 *                 monthlyTrend:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: January
 *                       value:
 *                         type: number
 *                         example: 4500
 *                 prometheusMetrics:
 *                   type: string
 *                   description: Raw Prometheus metrics in text format
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
r.get(
  '/',
  authRequired,
  authorize(PERMISSIONS.METRICS_READ),
  metricsController.getMetrics
);

export default r;
