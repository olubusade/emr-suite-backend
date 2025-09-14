import { ClinicalNote, Patient, User } from '../models/index.js';

/**
 * List clinical notes
 */
export async function listClinicalNotes({ limit = 200 }) {
  const safeLimit = Math.min(Number(limit) || 200, 1000);

  return ClinicalNote.findAll({
    order: [['createdAt', 'DESC']],
    limit: safeLimit,
    include: [
      { model: Patient, attributes: ['id', 'full_name'] },
      { model: User, as: 'doctor', attributes: ['id', 'full_name', 'email'] }
    ]
  });
}

/**
 * Get single clinical note
 */
export async function getClinicalNotesById(id) {
  return ClinicalNote.findByPk(id, {
    include: [
      { model: Patient, attributes: ['id', 'full_name', 'age'] },
      { model: User, as: 'doctor', attributes: ['id', 'full_name', 'email'] }
    ]
  });
}

/**
 * Create clinical note
 */
export async function createClinicalNote({ patientId, doctorId, soapNote, diagnosis, plan }) {
  const patient = await Patient.findByPk(patientId);
  if (!patient) throw new Error('Patient not found');

  const doctor = await User.findByPk(doctorId);
  if (!doctor) throw new Error('Doctor not found');

  return Clinical.create({
    patientId,
    doctorId,
    soapNote,
    diagnosis,
    plan
  });
}

/**
 * Update clinical note
 */
export async function updateClinicalNote(id, updates) {
  const clinical = await ClinicalNote.findByPk(id);
  if (!clinical) throw new Error('Clinical note not found');

  if ('soapNote' in updates) clinical.soapNote = updates.soapNote;
  if ('diagnosis' in updates) clinical.diagnosis = updates.diagnosis;
  if ('plan' in updates) clinical.plan = updates.plan;

  await clinical.save();
  return getClinicalNotesById(clinical.id);
}

/**
 * Delete clinical note
 */
export async function deleteClinicalNote(id) {
  const clinical = await ClinicalNote.findByPk(id);
  if (!clinical) throw new Error('Clinical note not found');

  await clinical.destroy();
  return clinical;
}
