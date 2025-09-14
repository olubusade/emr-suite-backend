import { Vital, Patient, User } from '../models/index.js';

export async function listVitals({ limit = 200 }) {
  const safeLimit = Math.min(Number(limit) || 200, 1000);
  return Vitals.findAll({
    limit: safeLimit,
    order: [['createdAt', 'DESC']],
    include: [
      { model: Patient, attributes: ['id', 'full_name'] },
      { model: User, as: 'nurse', attributes: ['id', 'full_name'] },
    ],
  });
}

export async function getVitalById(id) {
  return Vital.findByPk(id, {
    include: [
      { model: Patient, attributes: ['id', 'full_name'] },
      { model: User, as: 'nurse', attributes: ['id', 'full_name'] },
    ],
  });
}

export async function createVital({ patientId, nurseId, bloodPressure, heartRate, temperature, weight }) {
  return Vital.create({ patientId, nurseId, bloodPressure, heartRate, temperature, weight });
}

export async function updateVital(id, updates) {
  const vital = await Vital.findByPk(id);
  if (!vital) throw new Error('Vitals not found');
  await vital.update(updates);
  return vital;
}

export async function deleteVital(id) {
  const vital = await Vital.findByPk(id);
  if (!vital) throw new Error('Vitals not found');
  await vital.destroy();
  return vital;
}
