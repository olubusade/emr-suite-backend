import express from 'express';
import * as clinicalController from '../controllers/clinical.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/permission.middleware.js';
import { validate } from '../utils/validation.js';
import { 
  createClinicalNoteSchema, 
  updateClinicalNoteSchema, 
  getClinicalNotesSchema, 
  listClinicalNotesSchema 
} from '../validation/schemas.js';
import { PERMISSIONS } from '../constants/index.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Clinical
 *   description: Clinical notes management (SOAP)
 */

/**
 * @swagger
 * /clinical:
 *   get:
 *     summary: List all clinical notes
 *     tags: [Clinical]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: patientId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: staffId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: List of clinical notes
 */
router.get(
  '/',
  authRequired,
  authorize(PERMISSIONS.CLINICAL_READ),
  validate(listClinicalNotesSchema),
  clinicalController.listClinicalNotes
);

/**
 * @swagger
 * /clinical:
 *   post:
 *     summary: Create a new clinical note
 *     tags: [Clinical]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateClinicalNote'
 *     responses:
 *       201:
 *         description: Clinical note created
 */
router.post(
  '/',
  authRequired,
  authorize(PERMISSIONS.CLINICAL_CREATE),
  validate(createClinicalNoteSchema),
  clinicalController.createClinicalNote
);

/**
 * @swagger
 * /clinical/{id}:
 *   get:
 *     summary: Get a single clinical note
 *     tags: [Clinical]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Clinical note found
 */
router.get(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.CLINICAL_READ),
  validate(getClinicalNotesSchema),
  clinicalController.getClinicalNotes
);

/**
 * @swagger
 * /clinical/{id}:
 *   put:
 *     summary: Update a clinical note
 *     tags: [Clinical]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateClinicalNote'
 *     responses:
 *       200:
 *         description: Clinical note updated
 */
router.put(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.CLINICAL_UPDATE),
  validate(updateClinicalNoteSchema),
  clinicalController.updateClinicalNote
);

/**
 * @swagger
 * /clinical/{id}:
 *   delete:
 *     summary: Delete a clinical note
 *     tags: [Clinical]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Clinical note deleted
 */
router.delete(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.CLINICAL_DELETE),
  validate(getClinicalNotesSchema),
  clinicalController.deleteClinicalNote
);

export default router;
