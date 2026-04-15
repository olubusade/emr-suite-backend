import { ok, created, error,deleted } from '../../shared/utils/response.js';
import { attachAudit } from '../../shared/middlewares/audit.middleware.js';
import * as appointmentService from './appointment.service.js';
import { AUDIT_ACTIONS } from '../../constants/index.js';
/**
 * APPOINTMENT CONTROLLER
 * Orchestrates clinical scheduling while maintaining a clean 
 * separation between the API layer and business logic.
 */

/**
 * List appointments with pagination and filters
 */
export async function listAppointments(req, res, next) {
  try {
    const query = req.query || {}; 
    const page = parseInt(query.page, 10) || 1;
    const pageSize = parseInt(query.limit, 10) || 20;
    const { status, search, timeFrame } = query;

    const appointments = await appointmentService.listAppointments({ 
      page, 
      pageSize, 
      search, 
      status, 
      timeFrame 
    });

    return ok(res, appointments, 'Appointments retrieved successfully', {
      page: appointments.page,
      pages: appointments.pages,
      total: appointments.total,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get a single appointment by ID
 */
export async function getAppointment(req, res, next) {
  try {
    const appointment = await appointmentService.getAppointmentById(req.params.id);
    
    return ok(res, appointment);
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new appointment
 */
export async function createAppointment(req, res, next) {
  try {
    const payload = {
      ...req.body,
      createdBy: req.user.id
    };
    const appointment = await appointmentService.createAppointment(payload);

    // Audit remains here as it requires 'req' context (IP, User-Agent, etc.)
    await attachAudit(req, {
      action: AUDIT_ACTIONS.APPOINTMENT_CREATE,
      entity: 'appointment',
      entityId: appointment.id,
      metadata: { ...req.body },
    });

    return created(res, appointment, 'Appointment scheduled successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Update appointment details
 */
export async function updateAppointment(req, res, next) {
  try {
    req.body.updatedBy = req.user.id;
    const result = await appointmentService.updateAppointment(req.params.id, req.body);

    await attachAudit(req, {
      action: 'UPDATE_APPOINTMENT',
      entity: 'appointment',
      entityId: result.appointment.id,
      before: result.audit.before,
      after: result.audit.after
      
    });

    return ok(res, result, 'Appointment updated successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Mark an appointment as cancelled
 */
export async function cancelAppointment(req, res, next) {
  try {
    const appointment = await appointmentService.cancelAppointment(req.params.id);

    await attachAudit(req, {
      action: AUDIT_ACTIONS.APPOINTMENT_CANCEL,
      entity: 'appointment',
      entityId: appointment.id,
      metadata: { previousStatus: 'scheduled', newStatus: 'cancelled' },
    });

    return deleted(res, { id: appointment.id, status: appointment.status }, 'Appointment cancelled');
  } catch (err) {
     next(err);
  }
}