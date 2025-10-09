import { ok, created, error } from '../utils/response.js';
import { attachAudit } from '../middlewares/audit.middleware.js';
import * as appointmentService from '../services/appointment.service.js';

/**
 * List appointments
 */
export async function listAppointments(req, res) {

  try {
      const page = parseInt(req.query.page, 10) || 1;
      const pageSize = parseInt(req.query.pageSize, 10) || 20;
  
      const appointments = await appointmentService.listAppointments({ ...req.query, page, pageSize });
      return ok(res, appointments, 'Appointments retrieved successfully', {
        page: appointments.page,
        pages: appointments.pages,
        total: appointments.total,
      });
    } catch (err) {
      console.error('appointment.listAppointments', err);
      return error(res, err.statusCode || 500, err.message || 'Unable to list appointments');
    }
}

/**
 * Get a single appointment
 */
export async function getAppointment(req, res) {
  try {
    const appointment = await appointmentService.getAppointmentById(req.params.id);
    if (!appointment) return error(res, 404, 'Appointment not found');
    return ok(res, appointment);
  } catch (err) {
    return error(res, 500, 'Server error', err.message);
  }
}

/**
 * Create appointment
 */
export async function createAppointment(req, res) {
  try {
    const appointment = await appointmentService.createAppointment(req.body);

    await attachAudit(req, {
      action: 'CREATE_APPOINTMENT',
      entity: 'appointment',
      entityId: appointment.id,
      metadata: { ...req.body },
    });

    return created(res, appointment, 'Appointment created');
  } catch (err) {
    return error(res, 400, 'Error creating appointment', err.message);
  }
}

/**
 * Update appointment
 */
export async function updateAppointment(req, res) {
  try {
    const appointment = await appointmentService.updateAppointment(req.params.id, req.body);

    await attachAudit(req, {
      action: 'UPDATE_APPOINTMENT',
      entity: 'appointment',
      entityId: appointment.id,
      metadata: { ...req.body },
    });

    return ok(res, appointment);
  } catch (err) {
    return error(res, 400, 'Error updating appointment', err.message);
  }
}

/**
 * Cancel appointment
 */
export async function cancelAppointment(req, res) {
  try {
    const appointment = await appointmentService.cancelAppointment(req.params.id);

    await attachAudit(req, {
      action: 'CANCEL_APPOINTMENT',
      entity: 'appointment',
      entityId: appointment.id,
      metadata: { previousStatus: 'scheduled', newStatus: 'canceled' },
    });

    return ok(res, { id: appointment.id, status: appointment.status }, 'Appointment cancelled');
  } catch (err) {
    return error(res, 400, 'Error cancelling appointment', err.message);
  }
}
