import { Appointment, Patient, User } from '../models/index.js';
import { calculateAge } from '../utils/myLibrary.js';
/**
 * List appointments with optional limit
 */

export async function listAppointments({ page = 1, pageSize = 20, search }) {
  const pageInt = Number(page) || 1;
  const limitInt = Number(pageSize) || 20;
  const offset = (pageInt - 1) * limitInt;
const where = search
    ? { firstName: { [Ou.iLike]: `%${search}%` } }
    : {};
   
  const {count, rows } = await Appointment.findAndCountAll({
    limit: limitInt,
    offset,
    order: [['appointment_date', 'DESC']],
    include: [
      {
        model: Patient, as: 'patient', attributes: ['id', 'firstName', 'lastName', 'email'],
        
        where,
       },
      { model: User, as: 'staff', attributes: ['id', 'fullName', 'email'] }
    ]
  });

  const items = rows.map(appt => ({
    id: appt.id,
    patientId: appt.patientId,
    staffId: appt.staffId,
    appointmentDate: appt.appointmentDate,
    durationMinutes: appt.durationMinutes,
    reason: appt.reason,
    notes: appt.notes,
    status: appt.status,
    patient: appt.patient ? { id: appt.patient.id, fullName: appt.patient.firstName+' '+ appt.patient.lastName, email:appt.patient.email} : null,
    staff: appt.staff ? { id: appt.staff.id, fullName: appt.staff.fullName, email: appt.staff.email } : null
  }));
   return {
    items,
    total: count,
    page: pageInt,
    pages: Math.ceil(count / limitInt)
  };
}

/**
 * Get appointment by ID
 */
export async function getAppointmentById(id) {
  const appt = await Appointment.findByPk(id, {
    include: [
      { model: Patient, as:patient, attributes: ['id', 'firstName','lastName', 'dob'] },
      { model: User, as: 'staff', attributes: ['id', 'fullName', 'email'] }
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
    patient: appt.patient ? { id: appt.patient.id, fullName: appt.patient.firstName+' '+ appt.patient.lastName, age: calculateAge(appt.patient.dob) } : null,
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
