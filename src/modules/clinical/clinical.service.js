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
export async function getClinicalNotesById(id, user) {
  try {
    const note = await ClinicalNote.findByPk(id, {
      include: [
        { model: Patient, as: 'patient', attributes: ['id', 'firstName', 'lastName', 'dob', 'gender'] },
        { model: User, as: 'doctor', attributes: ['id', 'fullName', 'designation', 'email'] },
        { model: Appointment, as: 'appointment', attributes: ['id', 'appointmentDate', 'reason'] }
      ]
    });

    if (!note) return null;

    // 🔒 Enforce BTG
    const roles = (user.roles || []).map(r => r);
    const isPrivileged = roles.some(r =>
      ['doctor', 'admin', 'super_admin'].includes(r)
    );

    if (!isPrivileged) {
      
      const btg = await BTGRequest.findOne({
        where: {
          patientId: note.patientId,
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

    return note;

  } catch (err) {
    reportError(err, { service: 'ClinicalService', operation: 'getClinicalNotesById', noteId: id });
    throw err;
  }
}

/**
 * Get clinical notes by patient ID
 */
export async function getClinicalNotesByPatientId(patientId,user) {
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
          as:'appointment',
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
export async function updateClinicalNote(id, updates, user) {
  try {
    const clinical = await ClinicalNote.findByPk(id, {
      include: [{ model: Appointment, as: 'appointment' }]
    });

    if (!clinical) throw new ApiError(404, 'Clinical note not found');

    // 🛡️ 1. COMPLIANCE GUARD (already correct)
    if (clinical.appointment?.status === 'completed') {
      throw new ApiError(403, 'Legal Integrity: Cannot edit a finalized medical record.');
    }

    // 🔒 2. BTG ENFORCEMENT
    const roles = (user.roles || []).map(r => r);
    const isPrivileged = roles.some(r =>
      ['doctor', 'admin', 'super_admin'].includes(r)
    );

    if (!isPrivileged) {
      
      const btg = await BTGRequest.findOne({
        where: {
          patientId: clinical.patientId,
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

    // ✏️ 3. UPDATE
    await clinical.update(updates);

    // 🔄 4. RETURN UPDATED RECORD (pass user again for safety)
    return getClinicalNotesById(clinical.id, user);

  } catch (err) {
    reportError(err, {
      service: 'ClinicalService',
      operation: 'updateClinicalNote',
      noteId: id
    });
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
