import express from 'express';
import * as metricsController from './metrics.controller.js';
import { authRequired } from '../../shared/middlewares/auth.middleware.js';
import { authorize } from '../../shared/middlewares/permission.middleware.js';
import { PERMISSIONS } from '../../constants/index.js';

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
 *     description: Returns aggregated hospital KPIs including patients, users, appointments, revenue, clinical and nurse dashboards, plus Prometheus metrics.
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         required: false
 *         schema:
 *           type: integer
 *           example: 12
 *         description: Number of months for patient trend analytics
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
 *                 userCount:
 *                   type: integer
 *                   example: 45
 *                 totalAppointments:
 *                   type: integer
 *                   example: 320
 *                 revenue:
 *                   type: number
 *                   example: 12500.50
 *                 revenuePending:
 *                   type: number
 *                   example: 2300.00
 *                 monthlyPatientTrend:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: "2026-01"
 *                       visits:
 *                         type: integer
 *                         example: 45
 *                 clinical:
 *                   type: object
 *                   description: Doctor-facing dashboard metrics
 *                 nurse:
 *                   type: object
 *                   description: Nurse operational dashboard metrics
 *                 prometheusMetrics:
 *                   type: string
 *                   description: Raw Prometheus metrics output
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get(
  '/',
  authRequired,
  authorize(PERMISSIONS.METRICS_READ),
  metricsController.getMetrics
);

export default router;