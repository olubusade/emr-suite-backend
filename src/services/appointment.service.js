const { Appointment, Patient, User } = require('../models');

async function listAppointments({ limit = 200 }) {
  limit = Math.min(Number(limit), 1000);
  return Appointment.findAll({
    order: [['scheduled_at', 'DESC']],
    limit,
    include: [
      { model: Patient, attributes: ['id', 'full_name'] },
      { model: User, as: 'Doctor', attributes: ['id', 'full_name', 'email'] }
    ]
  });
}

async function getAppointmentById(id) {
  return Appointment.findByPk(id, {
    include: [
      { model: Patient, attributes: ['id', 'full_name', 'age'] },
      { model: User, as: 'Doctor', attributes: ['id', 'full_name', 'email'] }
    ]
  });
}

async function createAppointment({ patient_id, doctor_id, scheduled_at, duration_minutes, reason, notes }) {
  const when = new Date(scheduled_at);
  if (Number.isNaN(when.getTime())) throw new Error('Invalid scheduled_at');
  if (when < new Date()) throw new Error('scheduled_at must be in the future');

  const patient = await Patient.findByPk(patient_id);
  if (!patient) throw new Error('Patient not found');

  const doctor = await User.findByPk(doctor_id);
  if (!doctor) throw new Error('Doctor not found');

  return Appointment.create({
    patient_id,
    doctor_id,
    scheduled_at: when,
    duration_minutes: duration_minutes || null,
    reason: reason || null,
    notes: notes || null,
    status: 'SCHEDULED'
  });
}

async function updateAppointment(id, updates) {
  const appt = await Appointment.findByPk(id);
  if (!appt) throw new Error('Appointment not found');

  if (updates.scheduled_at) {
    const when = new Date(updates.scheduled_at);
    if (Number.isNaN(when.getTime())) throw new Error('Invalid scheduled_at');
    appt.scheduled_at = when;
  }
  if ('duration_minutes' in updates) appt.duration_minutes = updates.duration_minutes;
  if ('reason' in updates) appt.reason = updates.reason;
  if ('notes' in updates) appt.notes = updates.notes;
  if (updates.status) appt.status = updates.status;
  if (updates.doctor_id) {
    const doctor = await User.findByPk(updates.doctor_id);
    if (!doctor) throw new Error('Doctor not found');
    appt.doctor_id = updates.doctor_id;
  }

  await appt.save();
  return appt;
}

async function cancelAppointment(id) {
  const appt = await Appointment.findByPk(id);
  if (!appt) throw new Error('Appointment not found');

  appt.status = 'CANCELLED';
  await appt.save();
  return appt;
}

module.exports = {
  listAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  cancelAppointment
};
