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
} from '../../shared/validation/schemas.js';
import { PERMISSIONS } from '../../constants/index.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Vitals
 *   description: Patient vital signs management
 */

/* -------------------------------------------------------------------------- */
/* LIST VITALS                                                                */
/* -------------------------------------------------------------------------- */
/**
 * @swagger
 * /api/vitals:
 *   get:
 *     summary: Get all vitals
 *     description: Retrieve all vital records with optional filtering by patientId.
 *     tags: [Vitals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: Vitals retrieved successfully
 */
router.get(
  '/',
  authRequired,
  authorize(PERMISSIONS.VITAL_READ),
  vitalsController.listVitals
);

/* -------------------------------------------------------------------------- */
/* CREATE VITAL                                                              */
/* -------------------------------------------------------------------------- */
/**
 * @swagger
 * /api/vitals:
 *   post:
 *     summary: Create a vital record
 *     description: Create a new patient vital reading.
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
 */
router.post(
  '/',
  authRequired,
  authorize(PERMISSIONS.VITAL_CREATE),
  validate(createVitalSchema),
  vitalsController.createVital
);

/* -------------------------------------------------------------------------- */
/* GET BY PATIENT                                                           */
/* -------------------------------------------------------------------------- */
/**
 * @swagger
 * /api/vitals/patient/{patientId}:
 *   get:
 *     summary: Get vitals by patient
 *     description: Retrieve full vital history for a patient.
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
 *     responses:
 *       200:
 *         description: Patient vitals retrieved successfully
 */
router.get(
  '/patient/:patientId',
  authRequired,
  authorize(PERMISSIONS.VITAL_READ),
  validate(getVitalByPatientSchema),
  vitalsController.getVitalsByPatient
);

/* -------------------------------------------------------------------------- */
/* GET BY APPOINTMENT                                                      */
/* -------------------------------------------------------------------------- */
/**
 * @swagger
 * /api/vitals/appointment/{appointmentId}:
 *   get:
 *     summary: Get vitals by appointment
 *     description: Retrieve vitals linked to a specific appointment.
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
 *     responses:
 *       200:
 *         description: Appointment vitals retrieved successfully
 */
router.get(
  '/appointment/:appointmentId',
  authRequired,
  authorize(PERMISSIONS.VITAL_READ),
  validate(getVitalsByAppointmentSchema),
  vitalsController.getVitalsByAppointment
);

/* -------------------------------------------------------------------------- */
/* GET SINGLE VITAL                                                        */
/* -------------------------------------------------------------------------- */
/**
 * @swagger
 * /api/vitals/{id}:
 *   get:
 *     summary: Get a vital record
 *     description: Retrieve a single vital record by ID.
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
 *       200:
 *         description: Vital retrieved successfully
 */
router.get(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.VITAL_READ),
  validate(getVitalsSchema),
  vitalsController.getVital
);

/* -------------------------------------------------------------------------- */
/* UPDATE VITAL                                                             */
/* -------------------------------------------------------------------------- */
/**
 * @swagger
 * /api/vitals/{id}:
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
 *         description: Vital updated successfully
 */
router.put(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.VITAL_UPDATE),
  validate(updateVitalSchema),
  vitalsController.updateVital
);

/* -------------------------------------------------------------------------- */
/* DELETE VITAL                                                            */
/* -------------------------------------------------------------------------- */
/**
 * @swagger
 * /api/vitals/{id}:
 *   delete:
 *     summary: Delete a vital record
 *     description: Permanently delete a vital record.
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
 *         description: Vital deleted successfully
 */
router.delete(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.VITAL_DELETE),
  validate(getVitalsSchema),
  vitalsController.deleteVital
);

export default router;