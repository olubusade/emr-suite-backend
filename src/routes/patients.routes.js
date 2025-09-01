import express from 'express';
import * as patientController from '../controllers/patient.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/permission.middleware.js';
import { PERMISSIONS } from '../constants/index.js';

const r = express.Router();

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: API endpoints to manage patient records
 */

/**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: List all patients
 *     description: Retrieves a list of patients. Requires PATIENT_READ permission.
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of patients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Patient'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /api/patients:
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /api/patients/{id}:
 *   put:
 *     summary: Update a patient
 *     description: Updates an existing patient record. Requires PATIENT_UPDATE permission.
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Patient ID
 *         schema:
 *           type: integer
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
 *               $ref: '#/components/schemas/Patient'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Patient not found
 */

/**
 * @swagger
 * /api/patients/{id}:
 *   delete:
 *     summary: Delete a patient
 *     description: Deletes a patient record. Requires PATIENT_DELETE permission.
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Patient ID
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Patient deleted successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Patient not found
 */

r.get(
  '/',
  authRequired,
  authorize(PERMISSIONS.PATIENT_READ),
  patientController.listPatients
);

r.post(
  '/',
  authRequired,
  authorize(PERMISSIONS.PATIENT_CREATE),
  patientController.createPatient
);

r.put(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.PATIENT_UPDATE),
  patientController.updatePatient
);

r.delete(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.PATIENT_DELETE),
  patientController.deletePatient
);

export default r;
