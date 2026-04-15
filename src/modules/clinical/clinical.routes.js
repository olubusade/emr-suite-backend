import express from 'express';
import * as clinicalController from './clinical.controller.js';
import { authRequired } from '../../shared/middlewares/auth.middleware.js';
import { authorize } from '../../shared/middlewares/permission.middleware.js';
import { validate } from '../../shared/utils/validation.js';
import { 
  createClinicalNoteSchema, 
  updateClinicalNoteSchema, 
  getClinicalNotesSchema, 
  listClinicalNotesSchema,
  getClinicalNotesByPatientSchema,
  getClinicalNotesByAppointmentSchema
} from '../../shared/validation/schemas.js';
import { PERMISSIONS } from '../../constants/index.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Clinical
 *   description: Clinical notes management (SOAP-based documentation)
 */

/**
 * @swagger
 * /clinical:
 *   get:
 *     summary: List all clinical notes
 *     tags: [Clinical]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: staffId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of clinical notes
 */
router.get(
  '/',
  authRequired,
  authorize(PERMISSIONS.CLINICAL_NOTE_READ),
  validate(listClinicalNotesSchema),
  clinicalController.listClinicalNotes
);

/**
 * @swagger
 * /clinical/patient/{patientId}:
 *   get:
 *     summary: Get clinical history for a patient
 *     description: Retrieves all SOAP notes associated with a patient (supports pagination)
 *     tags: [Clinical]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
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
 *         description: Patient clinical history retrieved successfully
 *       404:
 *         description: Patient not found or no records available
 */
router.get(
  '/patient/:patientId',
  authRequired,
  authorize(PERMISSIONS.CLINICAL_NOTE_READ),
  validate(getClinicalNotesByPatientSchema),
  clinicalController.getClinicalNotesByPatientId
);

/**
 * @swagger
 * /clinical/appointment/{appointmentId}:
 *   get:
 *     summary: Get clinical note by appointment
 *     description: Retrieves the clinical note tied to a specific appointment
 *     tags: [Clinical]
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
 *         description: Clinical note retrieved successfully
 *       404:
 *         description: No clinical note found for this appointment
 */
router.get(
  '/appointment/:appointmentId',
  authRequired,
  authorize(PERMISSIONS.CLINICAL_NOTE_READ),
  validate(getClinicalNotesByAppointmentSchema),
  clinicalController.getClinicalNotesByAppointment
);

/**
 * @swagger
 * /clinical:
 *   post:
 *     summary: Create a clinical note
 *     tags: [Clinical]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateClinicalNote'
 *     responses:
 *       201:
 *         description: Clinical note created successfully
 */
router.post(
  '/',
  authRequired,
  authorize(PERMISSIONS.CLINICAL_NOTE_CREATE),
  validate(createClinicalNoteSchema),
  clinicalController.createClinicalNote
);

/**
 * @swagger
 * /clinical/{id}:
 *   get:
 *     summary: Get a clinical note by ID
 *     tags: [Clinical]
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
 *         description: Clinical note retrieved successfully
 *       404:
 *         description: Clinical note not found
 */
router.get(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.CLINICAL_NOTE_READ),
  validate(getClinicalNotesSchema),
  clinicalController.getClinicalNotes
);

/**
 * @swagger
 * /clinical/{id}:
 *   put:
 *     summary: Update a clinical note
 *     tags: [Clinical]
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
 *             $ref: '#/components/schemas/UpdateClinicalNote'
 *     responses:
 *       200:
 *         description: Clinical note updated successfully
 */
router.put(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.CLINICAL_NOTE_UPDATE),
  validate(updateClinicalNoteSchema),
  clinicalController.updateClinicalNote
);

/**
 * @swagger
 * /clinical/{id}:
 *   delete:
 *     summary: Delete a clinical note
 *     tags: [Clinical]
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
 *         description: Clinical note deleted successfully
 */
router.delete(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.CLINICAL_NOTE_DELETE),
  validate(getClinicalNotesSchema),
  clinicalController.deleteClinicalNote
);

export default router;