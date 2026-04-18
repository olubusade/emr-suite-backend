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
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Vital'
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
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
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
 *         description: Patient vitals retrieved
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
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *       - in: query
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *     security:
 *       - bearerAuth: []
 * 
 *     parameters:
 *       - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *         format: uuid
 *
 *   responses:
 *    200:
 *       description: Vital retrieved successfully
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ApiResponse'
 *               - type: object
 *                 properties:
 *                   data:
 *                     $ref: '#/components/schemas/Vital'
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
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateVital'
 *
 *     responses:
 *       200:
 *         description: Vital updated successfully
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