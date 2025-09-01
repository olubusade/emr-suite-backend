import { Appointment, Patient, User } from '../models/index.js';

/**
 * List appointments with optional limit
 */
export async function listAppointments({ limit = 200 }) {
  const safeLimit = Math.min(Number(limit) || 200, 1000);

  const appointments = await Appointment.findAll({
    order: [['appointment_date', 'DESC']],
    limit: safeLimit,
    include: [
      { model: Patient, attributes: ['id', 'full_name'] },
      { model: User, as: 'staff', attributes: ['id', 'full_name', 'email'] }
    ]
  });

  return appointments.map((appt) => ({
    id: appt.id,
    patientId: appt.patientId,
    staffId: appt.staffId,
    appointmentDate: appt.appointmentDate,
    durationMinutes: appt.durationMinutes,
    reason: appt.reason,
    notes: appt.notes,
    status: appt.status,
    patient: appt.Patient ? { id: appt.Patient.id, fullName: appt.Patient.full_name } : null,
    staff: appt.staff ? { id: appt.staff.id, fullName: appt.staff.full_name, email: appt.staff.email } : null
  }));
}

/**
 * Get appointment by ID
 */
export async function getAppointmentById(id) {
  const appt = await Appointment.findByPk(id, {
    include: [
      { model: Patient, attributes: ['id', 'full_name', 'age'] },
      { model: User, as: 'staff', attributes: ['id', 'full_name', 'email'] }
    ]
  });

  if (!appt) return null;

  return {
    id: appt.id,
    patientId: appt.patientId,
    staffId: appt.staffId,
    appointmentDate: appt.appointmentDate,
    durationMinutes: appt.durationMinutes,
    reason: appt.reason,
    notes: appt.notes,
    status: appt.status,
    patient: appt.Patient ? { id: appt.Patient.id, fullName: appt.Patient.full_name, age: appt.Patient.age } : null,
    staff: appt.staff ? { id: appt.staff.id, fullName: appt.staff.full_name, email: appt.staff.email } : null
  };
}

/**
 * Create a new appointment
 */
export async function createAppointment({ patientId, staffId, appointmentDate, durationMinutes, reason, notes }) {
  const when = new Date(appointmentDate);
  if (Number.isNaN(when.getTime())) throw new Error('Invalid appointmentDate');
  if (when < new Date()) throw new Error('appointmentDate must be in the future');

  const patient = await Patient.findByPk(patientId);
  if (!patient) throw new Error('Patient not found');

  const staff = await User.findByPk(staffId);
  if (!staff) throw new Error('Staff not found');

  const appt = await Appointment.create({
    patientId,
    staffId,
    appointmentDate: when,
    durationMinutes: durationMinutes || null,
    reason: reason || null,
    notes: notes || null,
    status: 'scheduled'
  });

  return getAppointmentById(appt.id);
}

/**
 * Update an existing appointment
 */
export async function updateAppointment(id, updates) {
  const appt = await Appointment.findByPk(id);
  if (!appt) throw new Error('Appointment not found');

  if (updates.appointmentDate) {
    const when = new Date(updates.appointmentDate);
    if (Number.isNaN(when.getTime())) throw new Error('Invalid appointmentDate');
    appt.appointmentDate = when;
  }

  if ('durationMinutes' in updates) appt.durationMinutes = updates.durationMinutes;
  if ('reason' in updates) appt.reason = updates.reason;
  if ('notes' in updates) appt.notes = updates.notes;
  if (updates.status) appt.status = updates.status;

  if (updates.staffId) {
    const staff = await User.findByPk(updates.staffId);
    if (!staff) throw new Error('Staff not found');
    appt.staffId = updates.staffId;
  }

  await appt.save();
  return getAppointmentById(appt.id);
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(id) {
  const appt = await Appointment.findByPk(id);
  if (!appt) throw new Error('Appointment not found');

  appt.status = 'canceled';
  await appt.save();
  return getAppointmentById(appt.id);
}
