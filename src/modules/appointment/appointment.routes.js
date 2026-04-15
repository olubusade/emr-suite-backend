import express from 'express';
import * as appt from './appointment.controller.js';
import { authRequired } from '../../shared/middlewares/auth.middleware.js';
import { authorize } from '../../shared/middlewares/permission.middleware.js';
import { validate } from '../../shared/utils/validation.js';
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  getAppointmentSchema,
  listAppointmentsSchema
} from '../../shared/validation/schemas.js';
import { PERMISSIONS } from '../../constants/index.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Appointments
 * 
 *   description: Clinical scheduling and patient workflow management
 */

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: List appointments with filters and pagination
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, checked_in, awaiting_vitals, vitals_taken, in_consultation, completed, canceled]
 *       - in: query
 *         name: timeFrame
 *         schema:
 *           type: string
 *           enum: [PAST, UPCOMING, TODAY, ALL]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by patient name
 *     responses:
 *       200:
 *         description: Paginated list of appointments
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedAppointments'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  '/',
  authRequired,
  authorize(PERMISSIONS.APPOINTMENT_READ),
  validate(listAppointmentsSchema),
  async (req, res) => {
    await appt.listAppointments(req, res);
  }
);

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAppointment'
 *           example:
 *             patientId: "550e8400-e29b-41d4-a716-446655440000"
 *             staffId: "550e8400-e29b-41d4-a716-446655440001"
 *             appointmentDate: "2026-04-12"
 *             appointmentTime: "10:30"
 *             reason: "Routine checkup"
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  '/',
  authRequired,
  authorize(PERMISSIONS.APPOINTMENT_CREATE),
  validate(createAppointmentSchema),
  async (req, res) => {
    await appt.createAppointment(req, res);
  }
);

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     tags: [Appointments]
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
 *         description: Appointment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Appointment not found
 */
router.get(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.APPOINTMENT_READ),
  validate(getAppointmentSchema),
  async (req, res) => {
    await appt.getAppointment(req, res);
  }
);

/**
 * @swagger
 * /appointments/{id}:
 *   put:
 *     summary: Update an appointment
 *     tags: [Appointments]
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
 *             $ref: '#/components/schemas/UpdateAppointment'
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Invalid request or transition
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.APPOINTMENT_UPDATE),
  validate(updateAppointmentSchema),
  async (req, res) => {
    await appt.updateAppointment(req, res);
  }
);

/**
 * @swagger
 * /appointments/{id}:
 *   delete:
 *     summary: Cancel an appointment
 *     tags: [Appointments]
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
 *         description: Appointment cancelled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.APPOINTMENT_DELETE),
  validate(getAppointmentSchema),
  async (req, res) => {
    await appt.cancelAppointment(req, res);
  }
);

export default router;