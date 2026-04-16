import express from 'express';
import * as vitalsController from './vitals.controller.js';
import { authRequired } from '../../shared/middlewares/auth.middleware.js';
import { authorize } from '../../shared/middlewares/permission.middleware.js';
import { validate } from '../../shared/utils/validation.js';
import {
  createVitalSchema,
  updateVitalSchema,
  getVitalsSchema,
  getVitalByPatientSchema,
  getVitalsByAppointmentSchema
} from '../../shared/validation/index.js';
import { PERMISSIONS } from '../../constants/index.js';

const router = express.Router();

/**
 * =========================
 * VITALS MODULE
 * =========================
 * @swagger
 * tags:
 *   name: Vitals
 *   description: Patient vital signs management
 */

// ======================================================================
// LIST VITALS
// ======================================================================

/**
 * @swagger
 * /vitals:
 *   get:
 *     summary: Retrieve vitals
 *     tags: [Vitals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vitals retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  '/',
  authRequired,
  authorize(PERMISSIONS.VITAL_READ),
  vitalsController.listVitals
);

// ======================================================================
// CREATE VITAL
// ======================================================================

/**
 * @swagger
 * /vitals:
 *   post:
 *     summary: Create vital record
 *     tags: [Vitals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVital'
 *     responses:
 *       201:
 *         description: Vital created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post(
  '/',
  authRequired,
  authorize(PERMISSIONS.VITAL_CREATE),
  validate(createVitalSchema),
  vitalsController.createVital
);

// ======================================================================
// BY PATIENT
// ======================================================================

/**
 * @swagger
 * /vitals/patient/{patientId}:
 *   get:
 *     summary: Retrieve patient vitals
 *     tags: [Vitals]
 */
router.get(
  '/patient/:patientId',
  authRequired,
  authorize(PERMISSIONS.VITAL_READ),
  validate(getVitalByPatientSchema),
  vitalsController.getVitalsByPatient
);

// ======================================================================
// BY APPOINTMENT
// ======================================================================

/**
 * @swagger
 * /vitals/appointment/{appointmentId}:
 *   get:
 *     summary: Retrieve appointment vitals
 *     tags: [Vitals]
 */
router.get(
  '/appointment/:appointmentId',
  authRequired,
  authorize(PERMISSIONS.VITAL_READ),
  validate(getVitalsByAppointmentSchema),
  vitalsController.getVitalsByAppointment
);

// ======================================================================
// SINGLE VITAL
// ======================================================================

/**
 * @swagger
 * /vitals/{id}:
 *   get:
 *     summary: Retrieve single vital
 *     tags: [Vitals]
 */
router.get(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.VITAL_READ),
  validate(getVitalsSchema),
  vitalsController.getVital
);

// ======================================================================
// UPDATE VITAL
// ======================================================================

/**
 * @swagger
 * /vitals/{id}:
 *   put:
 *     summary: Update vital
 *     tags: [Vitals]
 */
router.put(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.VITAL_UPDATE),
  validate(updateVitalSchema),
  vitalsController.updateVital
);

// ======================================================================
// DELETE VITAL
// ======================================================================

/**
 * @swagger
 * /vitals/{id}:
 *   delete:
 *     summary: Delete vital
 *     tags: [Vitals]
 *     responses:
 *       200:
 *         description: Vital deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.VITAL_DELETE),
  validate(getVitalsSchema),
  vitalsController.deleteVital
);

export default router;