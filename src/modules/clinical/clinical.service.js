import { ClinicalNote, Patient, User, Appointment, sequelize } from '../../config/associations.js';
import { reportError } from '../../shared/utils/monitoring.js';
import ApiError from '../../shared/utils/ApiError.js';

/**
 * CLINICAL SERVICE
 * The medical engine of the EMR. Handles SOAP notes, diagnoses, and encounter states.
 * Integrated with the workflow engine to transition appointment statuses.
 */

/**
 * List clinical notes with pagination guardrails
 */
export async function listClinicalNotes({ limit = 200 }) {
  const safeLimit = Math.min(Number(limit) || 200, 1000);
  try {
      return ClinicalNote.findAll({
        order: [['createdAt', 'DESC']],
        limit: safeLimit,
        include: [
          { model: Patient, attributes: ['id', 'full_name'] },
          { model: User, as: 'doctor', attributes: ['id', 'full_name', 'email'] }
        ]
  });
  } catch (err) {
    reportError(err, { service: 'ClinicalService', operation: 'listClinicalNotes' });
    throw err;
  }
  
}

/**
 * Get single clinical note with full medical context
 */
export async function getClinicalNotesById(id) {
  try {
    const note = await ClinicalNote.findByPk(id, {
      include: [
        { model: Patient, as: 'patient', attributes: ['id', 'firstName', 'lastName', 'dob', 'gender'] },
        { model: User, as: 'doctor', attributes: ['id', 'fullName', 'designation', 'email'] },
        { model: Appointment, as: 'appointment', attributes: ['id', 'appointmentDate', 'reason'] }
      ]
    });
    return note;
  } catch (err) {
    reportError(err, { service: 'ClinicalService', operation: 'getClinicalNotesById', noteId: id });
    throw err;
  }
}

/**
 * Get clinical notes by patient ID
 */
export async function getClinicalNotesByPatientId(patientId) {
  try {
    return await ClinicalNote.findAll({
      where: { patientId },
      include: [
        { 
          model: User, 
          as: 'doctor',
          attributes: ['id', 'fName', 'lName'] 
        },
        { 
          model: Appointment, 
          as:'appointment',
          attributes: ['id', 'appointmentDate', 'status'] 
        }
      ],
      order: [['createdAt', 'DESC']]
    });   
  } catch (err) {
    reportError(err, { service: 'ClinicalService', operation: 'getClinicalNotesByPatientId', patientId: patientId });
    throw err;
  }
  
}

export async function getClinicalNotesByAppointmentId(data) {
  try {
    const { appointmentId, patientId} = data;
      return await ClinicalNote.findAll({
        where: { appointmentId,patientId },
        include: [
          { 
            model: User, 
            as: 'doctor',
            attributes: ['id', 'fName', 'lName'] 
          },
          { 
            model: Appointment, 
            as:'appointment',
            attributes: ['id', 'appointmentDate', 'status'] 
          }
        ],
        order: [['createdAt', 'DESC']]
    });
  } catch (err) {
    reportError(err, { service: 'ClinicalService', operation: 'getClinicalNotesByAppointmentId', appointmentId: data.appointmentId });
    throw err;
  }
  
}

/**
 * Create or Update a Clinical Note
 * This follows the "Workflow Engine" pattern to move the appointment forward.
 */
export async function createClinicalNote(data) {
  const { appointmentId, patientId, createdBy } = data;

  if (!appointmentId || !patientId || !createdBy) {
    throw new ApiError(400, 'Missing encounter context: Appointment, Patient, or Provider.');
  }

  const transaction = await sequelize.transaction();

  try {
    // 1. Verify Appointment Existence
    const appointment = await Appointment.findByPk(appointmentId, { transaction });
    if (!appointment) throw new ApiError(404, 'Linked appointment not found.');

    // 2. Upsert Pattern: Maintain one clinical record per encounter
    const [note, created] = await ClinicalNote.findOrCreate({
      where: { appointmentId },
      defaults: data,
      transaction
    });

    if (!created) {
      await note.update(data, { transaction });
    }

    // 3. 🚀 WORKFLOW TRANSITION
    // Moves the patient out of 'consultation' and makes them visible to Billing
    await Appointment.update(
      {
        status: 'completed',
        paymentStatus: appointment.paymentStatus === 'fully_paid' ? 'fully_paid' : 'unpaid'
      }, 
      { where: { id: appointmentId }, transaction }
    );

    await transaction.commit();
    return getClinicalNotesById(note.id);
  } catch (err) {
    await transaction.rollback();
    reportError(err, { service: 'ClinicalService', operation: 'createClinicalNote', appointmentId });
    throw err;
  }
}

/**
 * Update Clinical Note with Finalization Safety
 */
export async function updateClinicalNote(id, updates) {
  try {
    const clinical = await ClinicalNote.findByPk(id, {
      include: [{ model: Appointment, as: 'appointment' }]
    });
    
    if (!clinical) throw new ApiError(404, 'Clinical note not found');

    // 🛡️ COMPLIANCE GUARD: Prevent editing locked medical records
    if (clinical.appointment?.status === 'finalized') {
      throw new ApiError(403, 'Legal Integrity: Cannot edit a finalized medical record.');
    }

    await clinical.update(updates);
    return getClinicalNotesById(clinical.id);
  } catch (err) {
    reportError(err, { service: 'ClinicalService', operation: 'updateClinicalNote', noteId: id });
    throw err;
  }
}

/**
 * Delete clinical note
 */
export async function deleteClinicalNote(id) {
  try {
        const clinical = await ClinicalNote.findByPk(id);
        if (!clinical) throw new Error('Clinical note not found');

        await clinical.destroy();
        return clinical;  
  } catch (err) {
      reportError(err, { service: 'ClinicalService', operation: 'deleteClinicalNote', noteId: id });
      throw err;
  }
  
}
