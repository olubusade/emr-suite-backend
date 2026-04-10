import { Appointment, Patient, User } from '../models/index.js';
import { calculateAge } from '../utils/myLibrary.js';
import { Op } from 'sequelize';
/**
 * List appointments with optional limit
 */

export async function listAppointments({ page = 1, pageSize = 20, search, status, timeFrame }) {
  const pageInt = Number(page) || 1;
  const limitInt = Number(pageSize) || 20;
  const offset = (pageInt - 1) * limitInt;

  // Build patient search condition
  const patientWhere = search
    ? { firstName: { [Op.iLike]: `%${search}%` } }
    : {};

const now = new Date();
const currentTimeString = now.toTimeString().slice(0, 5); // Returns "HH:MM" format (e.g., "07:55")

let appointmentWhere = {};

if (status) appointmentWhere.status = status;

if (timeFrame === 'PAST') {
  appointmentWhere[Op.or] = [
    // 1. Any date before today
    { appointmentDate: { [Op.lt]: new Date(now.setHours(0, 0, 0, 0)) } },
    // 2. Today, but the time has already passed
    {
      [Op.and]: [
        { appointmentDate: { [Op.between]: [new Date(now.setHours(0, 0, 0, 0)), new Date(now.setHours(23, 59, 59, 999))] } },
        { appointmentTime: { [Op.lt]: currentTimeString } }
      ]
    }
  ];
} else if (timeFrame === 'UPCOMING') {
  appointmentWhere[Op.or] = [
    // 1. Any date after today
    { appointmentDate: { [Op.gt]: new Date(now.setHours(23, 59, 59, 999)) } },
    // 2. Today, but the time is in the future
    {
      [Op.and]: [
        { appointmentDate: { [Op.between]: [new Date(now.setHours(0, 0, 0, 0)), new Date(now.setHours(23, 59, 59, 999))] } },
        { appointmentTime: { [Op.gt]: currentTimeString } }
      ]
    }
  ];
} else if (timeFrame === 'TODAY') {
  const start = new Date().setHours(0, 0, 0, 0);
  const end = new Date().setHours(23, 59, 59, 999);
  appointmentWhere.appointmentDate = { [Op.between]: [new Date(start), new Date(end)] };
}

  const { count, rows } = await Appointment.findAndCountAll({
    limit: limitInt,
    offset,
    order: [['appointmentDate', 'DESC']],
    where: appointmentWhere,
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: ['id', 'firstName', 'lastName', 'email'],
        where: patientWhere,
      },
      {
        model: User,
        as: 'staff',
        attributes: ['id', 'fullName', 'email'],
      },
    ],
  });

  const items = rows.map((appt) => ({
    id: appt.id,
    patientId: appt.patientId,
    staffId: appt.staffId,
    appointmentDate: appt.appointmentDate,
    appointmentTime: appt.appointmentTime,
    createdAt: appt.createdAt,
    reason: appt.reason,
    notes: appt.notes,
    status: appt.status,
    patient: appt.patient
      ? {
          id: appt.patient.id,
          fullName: appt.patient.firstName + ' ' + appt.patient.lastName,
          email: appt.patient.email,
        }
      : null,
    staff: appt.staff
      ? { id: appt.staff.id, fullName: appt.staff.fullName, email: appt.staff.email }
      : null,
  }));

  return {
    items,
    total: count,
    page: pageInt,
    pages: Math.ceil(count / limitInt),
  };
}

/**
 * Get appointment by ID
 */
export async function getAppointmentById(id) {
  const appt = await Appointment.findByPk(id, {
    include: [
      { model: Patient, as:'patient', attributes: ['id', 'firstName','lastName', 'dob'] },
      { model: User, as: 'staff', attributes: ['id', 'fullName', 'email'] }
    ]
  });

  if (!appt) return null;
  

  return {
    id: appt.id,
    patientId: appt.patientId,
    staffId: appt.staffId,
    appointmentDate: appt.appointmentDate,
    appointmentTime: appt.appointmentTime,
    durationMinutes: appt.durationMinutes,
    reason: appt.reason,
    notes: appt.notes,
    status: appt.status,
    patient: appt.patient ? { id: appt.patient.id, fullName: appt.patient.firstName+' '+ appt.patient.lastName, age: calculateAge(appt.patient.dob) } : null,
    staff: appt.staff ? { id: appt.staff.id, fullName: appt.staff.fullName, email: appt.staff.email } : null
  };
}


/**
 * Create a new appointment
 */
export async function createAppointment({ 
  patientId, 
  staffId, 
  createdBy, 
  appointmentDate, 
  appointmentTime, // 🔑 Added
  reason, 
  notes 
}) {
  const when = new Date(appointmentDate);
  if (Number.isNaN(when.getTime())) throw new Error('Invalid appointmentDate');
  
  // Note: For a demo, you might want to allow "today" even if 'when' 
  // is a few minutes in the past due to server clock lag.
  if (when < new Date(new Date().setHours(0,0,0,0))) {
    throw new Error('appointmentDate cannot be in the past');
  }

  const [patient, staff] = await Promise.all([
    Patient.findByPk(patientId),
    User.findByPk(staffId)
  ]);

  if (!patient) throw new Error('Patient not found');
  if (!staff) throw new Error('Staff not found');

  const appt = await Appointment.create({
    patientId,
    staffId,
    createdBy,
    appointmentDate: when,
    appointmentTime, // 🔑 Map from payload to DB
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
  else if (updates.updatedBy) {
    const staff = await User.findByPk(updates.updatedBy);
    if (!staff) throw new Error('Staff not found');
    appt.updatedBy = updates.updatedBy;
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
