import express from 'express';
import * as patientController from './patient.controller.js';
import { authRequired } from '../../shared/middlewares/auth.middleware.js';
import { authorize } from '../../shared/middlewares/permission.middleware.js';
import { PERMISSIONS } from '../../constants/index.js';

const r = express.Router();

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Patient management endpoints
 */

/**
 * @swagger
 * /patients:
 *   get:
 *     summary: List all patients
 *     description: Retrieves a list of patients. Requires PATIENT_READ permission.
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patients retrieved successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
r.get(
  '/',
  authRequired,
  authorize(PERMISSIONS.PATIENT_READ),
  patientController.listPatients
);

/**
 * @swagger
 * /patients:
 *   post:
 *     summary: Create a new patient
 *     description: Adds a new patient record. Requires PATIENT_CREATE permission.
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
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
r.post(
  '/',
  authRequired,
  authorize(PERMISSIONS.PATIENT_CREATE),
  patientController.createPatient
);

/**
 * @swagger
 * /patients/{id}:
 *   get:
 *     summary: Get patient by ID
 *     description: Retrieve a single patient record by UUID
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
 *       404:
 *         description: Patient not found
 */
r.get(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.PATIENT_READ),
  patientController.getPatient
);

/**
 * @swagger
 * /patients/{id}:
 *   put:
 *     summary: Update a patient
 *     description: Updates an existing patient record. Requires PATIENT_UPDATE permission.
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
 *       404:
 *         description: Patient not found
 */
r.put(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.PATIENT_UPDATE),
  patientController.updatePatient
);

/**
 * @swagger
 * /patients/{id}:
 *   delete:
 *     summary: Delete a patient
 *     description: Deletes a patient record. Requires PATIENT_DELETE permission.
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
 *       204:
 *         description: Patient deleted successfully
 *       404:
 *         description: Patient not found
 */
r.delete(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.PATIENT_DELETE),
  patientController.deletePatient
);

export default r;