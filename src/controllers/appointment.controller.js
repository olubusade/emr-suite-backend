const { ok, created, error } = require('../utils/response');
const { attachAudit } = require('../middlewares/audit.middleware');
const appointmentService = require('../services/appointment.service');

async function listAppointments(req, res) {
  try {
    const rows = await appointmentService.listAppointments({ limit: req.query.limit });
    return ok(res, rows);
  } catch (err) {
    return error(res, 500, 'Server error', err.message);
  }
}

async function getAppointment(req, res) {
  try {
    const appt = await appointmentService.getAppointmentById(req.params.id);
    if (!appt) return error(res, 404, 'Appointment not found');
    return ok(res, appt);
  } catch (err) {
    return error(res, 500, 'Server error', err.message);
  }
}

async function createAppointment(req, res) {
  try {
    const appt = await appointmentService.createAppointment(req.body);

    await attachAudit(req, {
      action: 'CREATE_APPOINTMENT',
      entity: 'appointment',
      entityId: appt.id,
      metadata: { ...req.body }
    });

    return created(res, appt, 'Appointment created');
  } catch (err) {
    return error(res, 400, 'Error creating appointment', err.message);
  }
}

async function updateAppointment(req, res) {
  try {
    const appt = await appointmentService.updateAppointment(req.params.id, req.body);

    await attachAudit(req, {
      action: 'UPDATE_APPOINTMENT',
      entity: 'appointment',
      entityId: appt.id,
      metadata: { ...req.body }
    });

    return ok(res, appt);
  } catch (err) {
    return error(res, 400, 'Error updating appointment', err.message);
  }
}

async function cancelAppointment(req, res) {
  try {
    const appt = await appointmentService.cancelAppointment(req.params.id);

    await attachAudit(req, {
      action: 'CANCEL_APPOINTMENT',
      entity: 'appointment',
      entityId: appt.id,
      metadata: { previousStatus: 'SCHEDULED', newStatus: 'CANCELLED' }
    });

    return ok(res, { id: appt.id, status: appt.status }, 'Appointment cancelled');
  } catch (err) {
    return error(res, 400, 'Error cancelling appointment', err.message);
  }
}

module.exports = {
  listAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment
};
