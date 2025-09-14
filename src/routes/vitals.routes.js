import express from 'express';
import * as vitalsController from '../controllers/vitals.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/permission.middleware.js';
import { validate } from '../utils/validation.js';
import { 
  createVitalsSchema, 
  updateVitalsSchema, 
  getVitalsSchema 
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
 *     tags: [Vitals]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: patientId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: List of vitals
 */
router.get('/', 
  authRequired, 
  authorize(PERMISSIONS.VITALS_READ), 
  vitalsController.listVitals
);

/**
 * @swagger
 * /vitals:
 *   post:
 *     summary: Create a new vital record
 *     tags: [Vitals]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVital'
 *     responses:
 *       201:
 *         description: Vital record created
 */
router.post('/', 
  authRequired, 
  authorize(PERMISSIONS.VITALS_CREATE), 
  validate(createVitalsSchema), 
  vitalsController.createVital
);

/**
 * @swagger
 * /vitals/{id}:
 *   get:
 *     summary: Get a single vital record
 *     tags: [Vitals]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Vital record found
 */
router.get('/:id', 
  authRequired, 
  authorize(PERMISSIONS.VITALS_READ), 
  validate(getVitalsSchema), 
  vitalsController.getVital
);

/**
 * @swagger
 * /vitals/{id}:
 *   put:
 *     summary: Update a vital record
 *     tags: [Vitals]
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
 *             $ref: '#/components/schemas/UpdateVital'
 *     responses:
 *       200:
 *         description: Vital record updated
 */
router.put('/:id', 
  authRequired, 
  authorize(PERMISSIONS.VITALS_UPDATE), 
  validate(updateVitalsSchema), 
  vitalsController.updateVital
);

/**
 * @swagger
 * /vitals/{id}:
 *   delete:
 *     summary: Delete a vital record
 *     tags: [Vitals]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Vital record deleted
 */
router.delete('/:id', 
  authRequired, 
  authorize(PERMISSIONS.VITALS_DELETE), 
  validate(getVitalsSchema), 
  vitalsController.deleteVital
);

export default router;
