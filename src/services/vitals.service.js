import { Vital, Patient, User } from '../models/index.js';
import ApiError from '../utils/ApiError.js'; // Assuming you use this for consistency

// Helper function to calculate BMI
function calculateBMI(weightKg, heightCm) {
  if (weightKg && heightCm && heightCm > 0) {
    const heightMeters = heightCm / 100;
    const bmi = weightKg / (heightMeters * heightMeters);
    return parseFloat(bmi.toFixed(1)); // Round to 1 decimal place
  }
  return null;
}

/**
 * List vitals with optional limit
 */
export async function listVitals({ limit = 200 }) {
  const safeLimit = Math.min(Number(limit) || 200, 1000);
  return Vital.findAll({
    limit: safeLimit,
    order: [['reading_at', 'DESC']], // 🔑 Sort by reading time
    include: [
      { model: Patient, attributes: ['id', 'firstName', 'lastName'] }, // 🔑 Consistent naming
      { model: User, as: 'nurse', attributes: ['id', 'firstName', 'lastName'] }, // 🔑 Consistent naming
    ],
  });
}

/**
 * Get vital by ID
 */
export async function getVitalById(id) {
  const vital = await Vital.findByPk(id, {
    include: [
      { model: Patient, attributes: ['id', 'firstName', 'lastName'] },
      { model: User, as: 'nurse', attributes: ['id', 'firstName', 'lastName'] },
    ],
  });
  if (!vital) throw new ApiError(404, 'Vital record not found');
  return vital;
}

/**
 * Create a new vital record
 */
export async function createVital(data) {
  // 🔑 DOMAIN LOGIC: Calculate BMI if needed
  data.bmi = calculateBMI(data.weightKg, data.heightCm);
  
  // Ensure required foreign keys are present
  if (!data.patientId || !data.nurseId) {
      throw new ApiError(400, 'Patient ID and Nurse ID are required.');
  }

  // Use all fields defined in the model
  const vital = await Vital.create(data);
  return vital;
}

/**
 * Update an existing vital record
 */
export async function updateVital(id, updates) {
  const vital = await Vital.findByPk(id);
  if (!vital) throw new ApiError(404, 'Vital record not found');
  
  // 🔑 DOMAIN LOGIC: Recalculate BMI if height or weight is updated
  if (updates.weightKg || updates.heightCm) {
    const newWeight = updates.weightKg ?? vital.weightKg;
    const newHeight = updates.heightCm ?? vital.heightCm;
    updates.bmi = calculateBMI(newWeight, newHeight);
  }

  // 🛡️ SECURITY: Prevent updating immutable foreign keys
  delete updates.patientId;
  delete updates.nurseId;

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