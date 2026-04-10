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
      {
        model: Patient,
        as: 'patient',
        attributes: ['id', 'firstName', 'lastName']
      },
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
export async function getVitalsByAppointment(data) {
  
  const { appointmentId, patientId} = data;
  return await Vital.findOne({
    where: { appointmentId,patientId },
    // Standardized to 'nurse' to match your associations
    include: [{ model: User, as: 'nurse', attributes: ['id','fName', 'lName'] }]
  });
}
/**
 * Create or Update a vital record and advance appointment status.
 * This ensures one visit = one vital record, even with multiple saves.
 */
export async function createVital(data) {
  const { appointmentId, weightKg, heightCm, patientId } = data;

  // 1. Logic: Context Validation
  if (!appointmentId || !patientId) {
      throw new ApiError(400, 'Appointment and Patient context are required.');
  }

  // 2. Intellectual Calculation: BMI
  // We calculate this on the fly so the DB always has the latest derived value
  if (weightKg && heightCm) {
    data.bmi = calculateBMI(weightKg, heightCm);
  }
  
  // 3. The "Engine" Strategy: Upsert (Find or Create)
  // Prevents duplicate vital rows if the nurse clicks "Save" multiple times
  const [vital, created] = await Vital.findOrCreate({
    where: { appointmentId },
    defaults: { ...data }
  });

  if (!created) {
    // If record exists, update with latest measurements
    await vital.update(data);
  }

  // 4. Status Bump: Move the clinic workflow forward
  // This notifies the Doctor's dashboard that the patient is ready
  await Appointment.update(
    { status: 'vitals_taken' },
    { where: { id: appointmentId } }
  );

  // 5. Return standardized response with associations
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