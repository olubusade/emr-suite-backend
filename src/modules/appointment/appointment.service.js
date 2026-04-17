import { Appointment, Patient, User } from '../../config/associations.js';
import { calculateAge } from '../../shared/utils/myLibrary.js';
import { reportError } from '../../shared/utils/monitoring.js';
import { Op } from 'sequelize';
/**
 * APPOINTMENT SERVICE
 * Handles database orchestration for scheduling.
 * Logic is "silent" (no loggers) and throws errors for the controller to catch.
 */

const ALLOWED_STATUS_TRANSITIONS = {
  scheduled: ['checked_in', 'canceled'],
  checked_in: ['awaiting_vitals'],
  awaiting_vitals: ['vitals_taken'],
  vitals_taken: ['in_consultation'],
  in_consultation: ['completed'],
  completed: [],
  canceled: []
};

export async function listAppointments({ page = 1, pageSize = 20, search, status, timeFrame }) {
  const pageInt = Number(page) || 1;
  const limitInt = Number(pageSize) || 20;
  const offset = (pageInt - 1) * limitInt;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Build patient search condition
  const patientWhere = search
    ? { firstName: { [Op.iLike]: `%${search}%` } }
    : {};

const now = new Date();
const currentTimeString = now.toTimeString().slice(0, 5); // Returns "HH:MM" format (e.g., "07:55")

let appointmentWhere = {};

if (status) appointmentWhere.status = status;

  //Timeframe Logic
if (timeFrame === 'PAST') {
  appointmentWhere[Op.or] = [
    // 1. Any date before today
    { appointmentDate: { [Op.lt]: todayStart } },
    // 2. Today, but the time has already passed
    {
      [Op.and]: [
        { appointmentDate: { [Op.between]: [todayStart, todayEnd] } },
        { appointmentTime: { [Op.lt]: currentTimeString } }
      ]
    }
  ];
} else if (timeFrame === 'UPCOMING') {
  appointmentWhere[Op.or] = [
    // 1. Any date after today
    { appointmentDate: { [Op.gt]: todayEnd } },
    // 2. Today, but the time is in the future
    {
      [Op.and]: [
        { appointmentDate: { [Op.between]: [todayStart, todayEnd] } },
        { appointmentTime: { [Op.gt]: currentTimeString } }
      ]
    }
  ];
} else if (timeFrame === 'TODAY') {
  const start = new Date().setHours(0, 0, 0, 0);
  const end = new Date().setHours(23, 59, 59, 999);
  //Patient Search Logic
  appointmentWhere.appointmentDate = { [Op.between]: [new Date(start), new Date(end)] };
}
  try {
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

    return {
      items:rows.map(formatAppointment),
      total: count,
      page: pageInt,
      pages: Math.ceil(count / limitInt),
    };
  } catch (err) {
    reportError(err, { service: 'AppointmentService', operation: 'listAppointments' });
    throw err;
  }
}

/**
 * Get appointment by ID with full demographic context
 */
export async function getAppointmentById(id) {
  try {
    const appt = await Appointment.findByPk(id, {
      include: [
        { model: Patient, as:'patient', attributes: ['id', 'firstName','lastName', 'dob'] },
        { model: User, as: 'staff', attributes: ['id', 'fullName', 'email'] }
      ]
    });

    if (!appt) throw new Error('Appointment not found');;
    

    return {
      id: appt.id,
      patientId: appt.patientId,
      staffId: appt.staffId,
      appointmentDate: appt.appointmentDate,
      appointmentTime: appt.appointmentTime,
      durationMinutes: appt.durationMinutes,
      type: appt.type,
      reason: appt.reason,
      notes: appt.notes,
      status: appt.status,
      patient: appt.patient ? { id: appt.patient.id, fullName: appt.patient.firstName+' '+ appt.patient.lastName, age: calculateAge(appt.patient.dob) } : null,
      staff: appt.staff ? { id: appt.staff.id, fullName: appt.staff.fullName, email: appt.staff.email } : null
    }; 
  } catch (err) {
    reportError(err, { service: 'AppointmentService', operation: 'getAppointmentById', appointmentId: id });
    throw err;
  }
}

/**
 * Create a new appointment (Enforces future-dating)
 */
export async function createAppointment({ 
  patientId, 
  staffId, 
  createdBy, 
  appointmentDate, 
  appointmentTime,
  type,
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
  //prevent double booking
  const existing = await Appointment.findOne({
    where: {
      staffId,
      appointmentDate: when,
      appointmentTime
    }
  });

  if (existing) {
    throw new Error('Time slot already booked');
  }
  try {
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
      appointmentTime,
      type,
      reason: reason || null,
      notes: notes || null,
      status: 'scheduled'
    });

    return getAppointmentById(appt.id);
  } catch (err) {
    reportError(err, { service: 'AppointmentService', operation: 'createAppointment' });
    throw err;
  }
  
}

/**
 * Update appointment details and validate staff assignment
 */
export async function updateAppointment(id, updates) {
  try {
    const appt = await Appointment.findByPk(id);
    if (!appt) throw new Error('Appointment not found');
     // Capture current state BEFORE changes
    const previousData = appt.get({ plain: true });

    // Validate status transition
    if (updates.status) {
      const currentStatus = appt.status;
      const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];

      if (!allowed.includes(updates.status)) {
        throw new Error(
          `Invalid status transition from ${currentStatus} to ${updates.status}`
        );
      }

      appt.status = updates.status;
    }
    if (updates.appointmentDate) {
      const when = new Date(updates.appointmentDate);
      if (Number.isNaN(when.getTime())) throw new Error('Invalid appointmentDate');
      appt.appointmentDate = when;
    }

    if (updates.appointmentTime) {
      appt.appointmentTime = updates.appointmentTime;
    }

    if ('reason' in updates) appt.reason = updates.reason;
    if ('notes' in updates) appt.notes = updates.notes;
    if ('type' in updates) appt.notes = updates.type;
    if (updates.status) appt.status = updates.status;

    if (updates.staffId) {
      const staff = await User.findByPk(updates.staffId);
      if (!staff) throw new Error('Staff not found');
      appt.staffId = updates.staffId;
    }
    if (updates.updatedBy) {
      const staff = await User.findByPk(updates.updatedBy);
      if (!staff) throw new Error('Staff not found');
      appt.updatedBy = updates.updatedBy;
    }
   

    await appt.save();
    // Return BOTH updated + audit data
    const updated = await getAppointmentById(appt.id);

    return {
      appointment: updated,
      audit: {
        before: previousData,
        after: appt.get({ plain: true })
      }
    };
  } catch (err) {
    reportError(err, { service: 'AppointmentService', operation: 'updateAppointment', appointmentId: id });
    throw err;
  }
  
}

/**
 * Transition appointment to 'canceled' status
 */
export async function cancelAppointment(id) {
  try {
    const appt = await Appointment.findByPk(id);
    if (!appt) throw new Error('Appointment not found');

    appt.status = 'canceled';
    await appt.save();
    return getAppointmentById(appt.id);
  }catch (err) {
    reportError(err, { service: 'AppointmentService', operation: 'cancelAppointment', appointmentId: id });
    throw err;
  }
  
}

/**
 * Helper: Standardized Data Transfer Object (DTO)
 */
function formatAppointment(appt) {
  const plain = appt.get({ plain: true });
  return {
    id: plain.id,
    patientId: plain.patientId,
    staffId: plain.staffId,
    appointmentDate: plain.appointmentDate,
    appointmentTime: plain.appointmentTime,
    createdAt:plain.createdAt,
    reason: plain.reason,
    type: plain.type,
    status: plain.status,
    notes: plain.notes,
    patient: plain.patient ? {
      id: plain.patient.id,
      fullName: `${plain.patient.firstName} ${plain.patient.lastName}`,
      age: plain.patient.dob ? calculateAge(plain.patient.dob) : null
    } : null,
    staff: plain.staff ? {
      id: plain.staff.id,
      fullName: plain.staff.fullName,
      email: plain.staff.email
    } : null
  };
}