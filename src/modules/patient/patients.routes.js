import express from 'express';
import * as patientController from './patient.controller.js';
import { authRequired } from '../../shared/middlewares/auth.middleware.js';
import { authorize } from '../../shared/middlewares/permission.middleware.js';
import { PERMISSIONS } from '../../constants/index.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

const r = express.Router();

/**
 * =========================
 * PATIENT MODULE
 * =========================
 * @swagger
 * tags:
 *   name: Patients
 *   description: Patient management endpoints (EMR Core Module)
 */

/**
 * =========================
 * LIST PATIENTS
 * =========================
 * @swagger
 * /patients:
 *   get:
 *     summary: Get all patients
 *     description: Retrieves paginated list of patients (requires PATIENT_READ permission)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patients retrieved successfully
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
 *                         $ref: '#/components/schemas/Patient'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
r.get(
  '/',
  authRequired,
  authorize(PERMISSIONS.PATIENT_READ),
  asyncHandler(patientController.listPatients)
);

/**
 * =========================
 * CREATE PATIENT
 * =========================
 * @swagger
 * /patients:
 *   post:
 *     summary: Create a new patient
 *     description: |
 *       Registers a new patient in the EMR system.
 *       Requires PATIENT_CREATE permission.
 *       Automatically generates credentials and audit logs.
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientCreate'
 *     responses:
 *       201:
 *         description: Patient created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Patient'
 *       400:
 *         description: Validation error
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         description: Conflict - Email or phone already exists
 *       500:
 *         description: Internal server error
 */
r.post(
  '/',
  authRequired,
  authorize(PERMISSIONS.PATIENT_CREATE),
  asyncHandler(patientController.createPatient)
);

/**
 * =========================
 * GET PATIENT BY ID
 * =========================
 * @swagger
 * /patients/{id}:
 *   get:
 *     summary: Get patient by ID
 *     description: Retrieve a single patient record
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Patient retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Patient'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
r.get(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.PATIENT_READ),
  asyncHandler(patientController.getPatient)
);

/**
 * =========================
 * UPDATE PATIENT
 * =========================
 * @swagger
 * /patients/{id}:
 *   put:
 *     summary: Update patient
 *     description: Updates patient record (requires PATIENT_UPDATE permission)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientUpdate'
 *     responses:
 *       200:
 *         description: Patient updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Patient'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
r.put(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.PATIENT_UPDATE),
  asyncHandler(patientController.updatePatient)
);

/**
 * =========================
 * DELETE PATIENT
 * =========================
 * @swagger
 * /patients/{id}:
 *   delete:
 *     summary: Delete patient
 *     description: Deletes a patient record (requires PATIENT_DELETE permission)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Patient deleted successfully
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
r.delete(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.PATIENT_DELETE),
  asyncHandler(patientController.deletePatient)
);

export default r;