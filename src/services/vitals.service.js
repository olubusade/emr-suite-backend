import { Vital, Patient, User, Appointment } from '../models/index.js'; // 🔑 Added Appointment
import ApiError from '../utils/ApiError.js';

/**
 * Helper function to calculate BMI
 */
function calculateBMI(weightKg, heightCm) {
  if (weightKg && heightCm && heightCm > 0) {
    const heightMeters = heightCm / 100;
    const bmi = weightKg / (heightMeters * heightMeters);
    return parseFloat(bmi.toFixed(1));
  }
  return null;
}

/**
 * List vitals with Appointment context
 */
export async function listVitals({ limit = 200 }) {
  const safeLimit = Math.min(Number(limit) || 200, 1000);
  return Vital.findAll({
    limit: safeLimit,
    order: [['reading_at', 'DESC']],
    include: [
      { model: Patient, attributes: ['id', 'fName', 'lName'] },
      { model: User, as: 'nurse', attributes: ['id', 'fName', 'lName'] },
      { model: Appointment, attributes: ['id', 'status'] } // 🔑 Useful for timeline audit
    ],
  });
}

/**
 * Get vital by ID
 */
export async function getVitalById(id) {
  const vital = await Vital.findByPk(id, {
    include: [
      { model: Patient, attributes: ['id', 'fName', 'lName'] },
      { model: User, as: 'nurse', attributes: ['id', 'fName', 'lName'] },
      { model: Appointment, attributes: ['id', 'status'] }
    ],
  });
  if (!vital) throw new ApiError(404, 'Vital record not found');
  return vital;
}

/**
  * Get all vitals for a specific patient(History)
  */
export async function getVitalsByPatientId(patientId) {
  return await Vital.findAll({
    where: { patientId },
    include: [
      { model: User, as: 'nurse', attributes: ['id', 'fName', 'lName'] },
      { model: Appointment, attributes: ['id', 'status', 'appointmentDate'] }
    ],
    order: [['readingAt', 'DESC']] // 👈 Latest first for clinical history
  });
}

// vitals.controller.js
export async function getVitalsByAppointment(appointmentId) {
  
  return await Vital.findOne({
    where: { appointmentId },
    // You might want to include the staff who took the vitals
    include: [{ model: User, as: 'recordedBy', attributes: ['id','fName', 'lName'] }]
  });
}
/**
 * Create a new vital record and advance appointment status
 */
export async function createVital(data) {
  // 🔑 DOMAIN LOGIC: Calculate BMI
  data.bmi = calculateBMI(data.weightKg, data.heightCm);
  
  // 🛡️ Ensure clinical links are present
  if (!data.patientId || !data.nurseId || !data.appointmentId) {
      throw new ApiError(400, 'Patient, Nurse, and Appointment IDs are required.');
  }

  // Use a transaction if your setup supports it, otherwise a standard sequence:
  const vital = await Vital.create(data);

  // 🚀 STATUS BUMP: This moves the patient from 'checked_in' to 'vitals_taken'
  // This is what makes them appear on the Doctor's "Ready" list.
  await Appointment.update(
    { status: 'vitals_taken' },
    { where: { id: data.appointmentId } }
  );

  return getVitalById(vital.id);
}

/**
 * Update an existing vital record
 */
export async function updateVital(id, updates) {
  const vital = await Vital.findByPk(id);
  if (!vital) throw new ApiError(404, 'Vital record not found');
  
  // 🔑 DOMAIN LOGIC: Recalculate BMI on updates
  if (updates.weightKg || updates.heightCm) {
    const newWeight = updates.weightKg ?? vital.weightKg;
    const newHeight = updates.heightCm ?? vital.heightCm;
    updates.bmi = calculateBMI(newWeight, newHeight);
  }

  // 🛡️ SECURITY: Lock relational links
  delete updates.patientId;
  delete updates.nurseId;
  delete updates.appointmentId; 

  await vital.update(updates);
  return vital;
}

/**
 * Delete a vital record
 */
export async function deleteVital(id) {
  const deleted = await Vital.destroy({ where: { id } });
  if (!deleted) throw new ApiError(404, 'Vital record not found');
  return true;
}