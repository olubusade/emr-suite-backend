import { ClinicalNote, Patient, User, Appointment, sequelize, BTGRequest } from '../../config/associations.js';
import { reportError } from '../../shared/utils/monitoring.js';
import ApiError from '../../shared/utils/ApiError.js';
import { Op } from 'sequelize';
/**
 * CLINICAL SERVICE
 * The medical engine of the EMR. Handles SOAP notes, diagnoses, and encounter states.
 * Integrated with the workflow engine to transition appointment statuses.
 */

/**
 * List clinical notes with pagination guardrails
 */
export async function listClinicalNotes({ limit = 200, user }) {
  const safeLimit = Math.min(Number(limit) || 200, 1000);

  try {
    let whereClause = {};
    // Restrict non-privileged users
    const roles = (user.roles || []).map(r => r);
    const isPrivileged = roles.some(r =>
      ['doctor', 'admin', 'super_admin'].includes(r)
    );

    if (!isPrivileged) {

      // BTG logic
      const btgs = await BTGRequest.findAll({
        where: {
          requestedBy: user.id,
          status: 'APPROVED',
          expiresAt: { [Op.gt]: new Date() }
        },
        attributes: ['patientId']
      });

      const patientIds = btgs.map(b => b.patientId);

      if (!patientIds.length) {
        throw new ApiError(
          403,
          'Access denied: No active or valid Break-the-Glass request'
        ); // no access
      }
      whereClause.patientId = { [Op.in]: patientIds };
    }

    return await ClinicalNote.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: safeLimit,
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'firstName', 'lastName', 'fullName']
        },
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'fullName', 'email']
        }
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
export async function getClinicalNotesById({ noteId, user }) {
  try {
    const note = await ClinicalNote.findByPk(noteId, {
      include: [
        { model: Patient, as: 'patient', attributes: ['id', 'firstName', 'lastName', 'dob', 'gender'] },
        { model: User, as: 'doctor', attributes: ['id', 'fullName', 'designation', 'email'] },
        { model: Appointment, as: 'appointment', attributes: ['id', 'appointmentDate', 'status', 'paymentStatus'] }
      ]
    });

    if (!note) throw new ApiError(404, 'Clinical note not found');

    // Security Check
    await enforceBTGSecurity(note.patientId, user);

    return note;
  } catch (err) {
    reportError(err, { service: 'ClinicalService', operation: 'getClinicalNotesById', noteId });
    throw err;
  }
}

/**
 * Get clinical notes by patient ID
 */
export async function getClinicalNotesByPatientId(patientId, user) {
  try {
    // Allow privileged roles
    const roles = (user.roles || []).map(r => r);
    const isPrivileged = roles.some(r =>
      ['doctor', 'admin', 'super_admin'].includes(r)
    );

    if (!isPrivileged) {

      const btg = await BTGRequest.findOne({
        where: {
          patientId,
          requestedBy: user.id,
          status: 'APPROVED'
        }
      });

      if (!btg) {
        throw new ApiError(
          403,
          'Access denied: No active or valid Break-the-Glass request'
        );
      }
    }
    const notes = await ClinicalNote.findAll({
      where: { patientId },
      include: [
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'fName', 'lName']
        },
        {
          model: Appointment,
          as: 'appointment',
          attributes: ['id', 'appointmentDate', 'status']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    return notes;
  } catch (err) {
    reportError(err, { service: 'ClinicalService', operation: 'getClinicalNotesByPatientId', patientId: patientId });
    throw err;
  }

}

export async function getClinicalNotesByAppointmentId(data, user) {
  try {
    const { appointmentId, patientId } = data;

    // 🔒 BTG check
    const roles = (user.roles || []).map(r => r);
    const isPrivileged = roles.some(r =>
      ['doctor', 'admin', 'super_admin'].includes(r)
    );

    if (!isPrivileged) {

      const btg = await BTGRequest.findOne({
        where: {
          patientId,
          requestedBy: user.id,
          status: 'APPROVED',
          expiresAt: { [Op.gt]: new Date() }
        }
      });

      if (!btg) {
        throw new ApiError(
          403,
          'Access denied: No active or valid Break-the-Glass request'
        );
      }
    }

    return await ClinicalNote.findAll({
      where: { appointmentId, patientId },
      include: [
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'fName', 'lName']
        },
        {
          model: Appointment,
          as: 'appointment',
          attributes: ['id', 'appointmentDate', 'status']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

  } catch (err) {
    reportError(err, {
      service: 'ClinicalService',
      operation: 'getClinicalNotesByAppointmentId',
      appointmentId: data.appointmentId
    });
    throw err;
  }
}

/**
 * Create or Update a Clinical Note
 * This follows the "Workflow Engine" pattern to move the appointment forward.
 */
export async function createClinicalNote(data) {
  const { appointmentId, patientId, createdBy, user } = data;

  if (!appointmentId || !patientId || !createdBy) {
    throw new ApiError(400, 'Missing encounter context: Appointment, Patient, or Provider.');
  }

  const transaction = await sequelize.transaction();

  try {
    const appointment = await Appointment.findByPk(appointmentId, { transaction });
    if (!appointment) throw new ApiError(404, 'Linked appointment not found.');

    // 1. Upsert Pattern
    const [note, created] = await ClinicalNote.findOrCreate({
      where: { appointmentId },
      defaults: { ...data },
      transaction
    });

    if (!created) {
      await note.update(data, { transaction });
    }

    // 2. 🚀 WORKFLOW TRANSITION: Move to 'completed' for Billing visibility
    await appointment.update({
      status: 'completed',
      paymentStatus: appointment.paymentStatus === 'fully_paid' ? 'fully_paid' : 'unpaid'
    }, { transaction });

    await transaction.commit();
    
    // Return refreshed record with includes
    return getClinicalNotesById({ noteId: note.id, user });
  } catch (err) {
    await transaction.rollback();
    reportError(err, { service: 'ClinicalService', operation: 'createClinicalNote', appointmentId });
    throw err;
  }
}

/**
 * Update Clinical Note with Finalization Safety
 */
export async function updateClinicalNote(id, updates, user) {
  try {
    const clinical = await ClinicalNote.findByPk(id, {
      include: [{ model: Appointment, as: 'appointment' }]
    });

    if (!clinical) throw new ApiError(404, 'Clinical note not found');

    // 🛡️ Legal Integrity Guard
    if (clinical.appointment?.status === 'completed' && !updates.isCorrection) {
      throw new ApiError(403, 'Legal Integrity: Cannot edit a finalized medical record.');
    }

    // 🔒 Security Guard
    await enforceBTGSecurity(clinical.patientId, user);

    await clinical.update(updates);

    return getClinicalNotesById({ noteId: clinical.id, user });
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
    if (!clinical) throw new ApiError(404, 'Clinical note not found');

    await clinical.destroy();
    return clinical;
  } catch (err) {
    reportError(err, { service: 'ClinicalService', operation: 'deleteClinicalNote', noteId: id });
    throw err;
  }

}


/**
 * Helper: Enforce BTG Security
 * Centralized logic to ensure only privileged roles or approved BTG requests can access records.
 */
const enforceBTGSecurity = async (patientId, user) => {
  const roles = user.roles || [];
  const isPrivileged = roles.some(r => ['doctor', 'admin', 'super_admin'].includes(r));

  if (!isPrivileged) {
    const activeBtg = await BTGRequest.findOne({
      where: {
        patientId,
        requestedBy: user.id,
        status: 'APPROVED',
        expiresAt: { [Op.gt]: new Date() }
      }
    });

    if (!activeBtg) {
      throw new ApiError(403, 'Access denied: No active or valid Break-the-Glass authorization found.');
    }
  }
};