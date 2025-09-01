import express from 'express';
import * as appt from '../controllers/appointment.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/permission.middleware.js';
import { validate } from '../utils/validation.js';
import { createAppointmentSchema, updateAppointmentSchema, getAppointmentSchema, listAppointmentsSchema } from '../validation/schemas.js';
import { PERMISSIONS } from '../constants/index.js';

const router = express.Router();

// -------------------- List appointments -------------------- //
/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: List all appointments
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of appointments
 *       403:
 *         description: Forbidden
 */
router.get(
  '/',
  authRequired,
  authorize(PERMISSIONS.APPOINTMENT_READ),
  validate(listAppointmentsSchema),
  async (req, res, next) => {
    try {
      await appt.listAppointments(req, res);
      next();
    } catch (err) {
      next(err);
    }
  }
);

// -------------------- Create appointment -------------------- //
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
 *     responses:
 *       201:
 *         description: Appointment created
 *       403:
 *         description: Forbidden
 */
router.post(
  '/',
  authRequired,
  authorize(PERMISSIONS.APPOINTMENT_CREATE),
  validate(createAppointmentSchema),
  async (req, res, next) => {
    try {
      await appt.createAppointment(req, res);
      next();
    } catch (err) {
      next(err);
    }
  }
);

// -------------------- Get single appointment -------------------- //
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
 *           type: integer
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment details
 *       404:
 *         description: Appointment not found
 */
router.get(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.APPOINTMENT_READ),
  validate(getAppointmentSchema),
  async (req, res, next) => {
    try {
      await appt.getAppointment(req, res);
      next();
    } catch (err) {
      next(err);
    }
  }
);

// -------------------- Update appointment -------------------- //
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
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAppointment'
 *     responses:
 *       200:
 *         description: Appointment updated
 *       403:
 *         description: Forbidden
 */
router.put(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.APPOINTMENT_UPDATE),
  validate(updateAppointmentSchema),
  async (req, res, next) => {
    try {
      await appt.updateAppointment(req, res);
      next();
    } catch (err) {
      next(err);
    }
  }
);

// -------------------- Cancel appointment -------------------- //
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
 *           type: integer
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment canceled
 *       403:
 *         description: Forbidden
 */
router.delete(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.APPOINTMENT_DELETE),
  validate(getAppointmentSchema),
  async (req, res, next) => {
    try {
      await appt.cancelAppointment(req, res);
      next();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
