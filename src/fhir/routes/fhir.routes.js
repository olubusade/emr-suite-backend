import express from 'express';

import { PERMISSIONS } from '../../constants/index.js';

import { authRequired } from '../../shared/middlewares/auth.middleware.js';
import { authorize } from '../../shared/middlewares/permission.middleware.js';
import { validate } from '../../shared/utils/validation.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

import { getPatientFHIR } from '../controllers/patient.fhir.controller.js'; import { getObservationsFHIR } from '../controllers/observation.fhir.controller.js'; import { getConditionsFHIR } from '../controllers/condition.fhir.controller.js'; import { getAuditEventsFHIR } from '../controllers/audit.fhir.controller.js'; import { getClinicalNotesFHIR } from '../controllers/clinicalNotes.fhir.controller.js';
import {
  FHIRPatientRequestSchema,
  FHIRObservationRequestSchema,
  FHIRConditionRequestSchema,
  FHIRAuditEventRequestSchema,
  FHIRClinicalNoteRequestSchema
} from '../schemas/fhir.schema.js';

const router = express.Router();

/**
 * =====================================================
 * GLOBAL FHIR AUTH GATE
 * =====================================================
 * All FHIR endpoints require authentication
 */
router.use(authRequired);



// =====================================================
// PATIENT (FHIR RESOURCE)
// =====================================================
/**
 * @swagger
 * /fhir/Patient/{id}:
 *   get:
 *     summary: Retrieve FHIR Patient resource
 *     description: Returns a FHIR-compliant Patient resource for interoperability
 *     tags: [FHIR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Patient UUID
 *         schema:
 *           type: string
 *           example: 7d11441b-972a-416b-9db6-8fd79a4ae5be
 *     responses:
 *       200:
 *         description: Patient resource
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PatientFHIR'
 */
router.get(
  '/Patient/:id',
  authorize(PERMISSIONS.PATIENT_READ),
  validate(FHIRPatientRequestSchema),
  asyncHandler(getPatientFHIR)
);



// =====================================================
// OBSERVATION (VITALS)
// =====================================================
/**
 * @swagger
 * /fhir/Observation:
 *   get:
 *     summary: Retrieve FHIR Observations (Vitals)
 *     description: Returns patient vitals in FHIR Observation format
 *     tags: [FHIR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patient
 *         required: true
 *         description: Patient UUID
 *         schema:
 *           type: string
 *       - in: query
 *         name: dateFrom
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: dateTo
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Observation Bundle
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BundleFHIR'
 */
router.get(
  '/Observation',
  authorize(PERMISSIONS.VITAL_READ),
  validate(FHIRObservationRequestSchema),
  asyncHandler(getObservationsFHIR)
);



// =====================================================
// CONDITION (DIAGNOSIS)
// =====================================================
/**
 * @swagger
 * /fhir/Condition:
 *   get:
 *     summary: Retrieve FHIR Conditions (Diagnoses)
 *     tags: [FHIR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patient
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient UUID
 *     responses:
 *       200:
 *         description: Condition Bundle
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BundleFHIR'
 */
router.get(
  '/Condition',
  authorize(PERMISSIONS.CLINICAL_NOTE_READ),
  validate(FHIRConditionRequestSchema),
  asyncHandler(getConditionsFHIR)
);



// =====================================================
// CLINICAL NOTES (COMPOSITION)
// =====================================================
/**
 * @swagger
 * /fhir/ClinicalNotes:
 *   get:
 *     summary: Retrieve Clinical Notes (FHIR Composition)
 *     description: Returns SOAP-based clinical notes as FHIR Composition bundle
 *     tags: [FHIR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patient
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Composition Bundle
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BundleFHIR'
 */
router.get(
  '/ClinicalNotes',
  authorize(PERMISSIONS.CLINICAL_NOTE_READ),
  validate(FHIRClinicalNoteRequestSchema),
  asyncHandler(getClinicalNotesFHIR)
);



// =====================================================
// AUDIT EVENT (ADMIN ONLY)
// =====================================================
/**
 * @swagger
 * /fhir/AuditEvent:
 *   get:
 *     summary: Retrieve Audit Events (FHIR)
 *     description: Returns system audit trail in FHIR format
 *     tags: [FHIR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user UUID
 *     responses:
 *       200:
 *         description: Audit Event Bundle
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BundleFHIR'
 */
router.get(
  '/AuditEvent',
  authorize(PERMISSIONS.AUDIT_READ),
  validate(FHIRAuditEventRequestSchema),
  asyncHandler(getAuditEventsFHIR)
);

export default router;