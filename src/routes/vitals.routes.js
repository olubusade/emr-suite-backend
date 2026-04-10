import express from 'express';
import * as vitalsController from '../controllers/vitals.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/permission.middleware.js';
import { validate } from '../utils/validation.js';
import { 
  createVitalSchema, 
  updateVitalSchema, 
  getVitalsSchema,
  getVitalByPatientSchema,
  getVitalsByAppointmentSchema
} from '../validation/schemas.js';
import { PERMISSIONS } from '../constants/index.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Vitals
 *   description: Patient vital signs management
 */

/**
 * @swagger
 * /vitals:
 *   get:
 *     summary: List all vitals
 *     description: Retrieve all vital records, optionally filtered by patient.
 *     tags: [Vitals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patientId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter vitals by patient ID
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: List of vitals retrieved successfully
 */
router.get(
  '/',
  authRequired,
  authorize(PERMISSIONS.VITAL_READ),
  vitalsController.listVitals
);

/**
 * @swagger
 * /vitals:
 *   post:
 *     summary: Create a new vital record
 *     description: Capture a new set of patient vital readings.
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
 *         description: Vital record created successfully
 *       400:
 *         description: Validation error
 */
router.post(
  '/',
  authRequired,
  authorize(PERMISSIONS.VITAL_CREATE),
  validate(createVitalSchema),
  vitalsController.createVital
);

/**
 * @swagger
 * /vitals/patient/{patientId}:
 *   get:
 *     summary: Get all vitals for a specific patient
 *     description: Retrieves the full vital history for a patient.
 *     tags: [Vitals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique identifier of the patient
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Patient vitals retrieved successfully
 *       400:
 *         description: Invalid patient ID
 */
router.get(
  '/patient/:patientId',
  authRequired,
  authorize(PERMISSIONS.VITAL_READ),
  validate(getVitalByPatientSchema),
  vitalsController.getVitalsByPatient
);
/**
 * @swagger
 * /vitals/appointment/{appointmentId}:
 *   get:
 *     summary: Get all vitals for a specific appointment
 *     description: Retrieves the vital records associated with a given appointment. Optionally filters by patient.
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
 *         description: Unique identifier of the appointment
 *       - in: query
 *         name: patientId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Optional patient ID to further filter results
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: Vitals retrieved successfully
 *       400:
 *         description: Invalid appointment or patient ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  '/appointment/:appointmentId',
  authRequired,
  authorize(PERMISSIONS.VITAL_READ),
  validate(getVitalsByAppointmentSchema),
  vitalsController.getVitalsByAppointment
);

/**
 * @swagger
 * /vitals/{id}:
 *   get:
 *     summary: Get a single vital record
 *     description: Retrieve details of a specific vital record.
 *     tags: [Vitals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique identifier of the vital record
 *     responses:
 *       200:
 *         description: Vital record retrieved successfully
 *       404:
 *         description: Vital not found
 */
router.get(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.VITAL_READ),
  validate(getVitalsSchema),
  vitalsController.getVital
);

/**
 * @swagger
 * /vitals/{id}:
 *   put:
 *     summary: Update a vital record
 *     description: Update an existing vital record.
 *     tags: [Vitals]
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
 *             $ref: '#/components/schemas/UpdateVital'
 *     responses:
 *       200:
 *         description: Vital record updated successfully
 */
router.put(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.VITAL_UPDATE),
  validate(updateVitalSchema),
  vitalsController.updateVital
);

/**
 * @swagger
 * /vitals/{id}:
 *   delete:
 *     summary: Delete a vital record
 *     description: Permanently remove a vital record.
 *     tags: [Vitals]
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
 *         description: Vital record deleted successfully
 */
router.delete(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.VITAL_DELETE),
  validate(getVitalsSchema),
  vitalsController.deleteVital
);

export default router;