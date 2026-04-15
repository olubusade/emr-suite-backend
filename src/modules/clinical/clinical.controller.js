import { ok, created, error } from '../../shared/utils/response.js';
import { attachAudit } from '../../shared/middlewares/audit.middleware.js';
import * as clinicalService from './clinical.service.js';
import { AUDIT_ACTIONS } from '../../constants/index.js';
/**
 * CLINICAL CONTROLLER
 * Manages patient encounter documentation. 
 * This data represents the core medical record and requires strict auditability.
 */

/**
 * List clinical notes with pagination
 */
export async function listClinicalNotes(req, res, next) {
  try {
    const limit = req.query.limit;
    const result = await clinicalService.listClinicalNotes({ limit });
    return ok(res, result);
  } catch (err) {
    next(err);
  }
}

/**
 * Get single clinical note by ID
 */
export async function getClinicalNotes(req, res, next) {
  try {
    const clinical = await clinicalService.getClinicalNotesById(req.params.id);
    if (!clinical) {
      return next(new Error('Clinical note not found'));
    }
    return ok(res, clinical);
  } catch (err) {
    next(err);
  }
}
/**
 * Get all clinical notes for a specific patient (Medical History)
 */
  export async function getClinicalNotesByPatientId(req, res, next) {
    
    
    try { 
      const { patientId } = req.params;
      if (!patientId) {
        return next(new Error('Patient ID is required'));
      } 
      const history = await clinicalService.getClinicalNotesByPatientId(patientId);
      return ok(res, history, 'Patient medical history retrieved');
    } catch (err) {
        next(err);
    }
  }
/**
 * Get clinical note for a specific appointment
 */
export async function getClinicalNotesByAppointment (req, res, next) {
  try { 
    const { appointmentId } = req.params;
    const { patientId } = req.query;
    if (!appointmentId) { 
      return next(new Error('Appointment ID is required'));
    }

    if (!patientId) { 
      return next(new Error('Patient ID is required'));
    } 
    const data = { appointmentId, patientId };
    const history = await clinicalService.getClinicalNotesByAppointmentId(data);
    return ok(res, history);
  }catch (err) {
    next(err);
  }
}
/**
 * Create clinical note (Doctor/Nurse Encounter)
 */
export async function createClinicalNote(req, res, next) {
  try {
    // SECURITY: Inject staffId (Doctor/Clinician) from the authenticated user
    const clinicalData = { 
      ...req.body,
      staffId:req.user.id,
      createdBy: req.user.id 
    };
    
    const clinical = await clinicalService.createClinicalNote(clinicalData);

    // Audit Trail
    await attachAudit(req, {
      action: AUDIT_ACTIONS.CLINICAL_NOTE_CREATE,
      entity: 'clinical',
      entityId: clinical.id,
      metadata: { appointmentId: clinical.appointmentId, patientId: clinical.patientId },
    });

    return created(res, clinical, 'Clinical note recorded successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Update clinical note
 */
export async function updateClinicalNote(req, res, next) {
  try {
    const noteId = req.params.id;
    const before = await clinicalService.getClinicalNotesById(noteId);
    const clinical = await clinicalService.updateClinicalNote(noteId, req.body);

    //Audit Trail
    await attachAudit(req, {
      action: AUDIT_ACTIONS.CLINICAL_NOTE_UPDATE,
      entity: 'clinical',
      entityId: clinical.id,
      metadata: { ...req.body, updatedBy: req.user.id },
      before,
      after:clinical
    });

    return ok(res, clinical, 'Clinical note updated successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Delete clinical note (Soft Delete recommended in Service layer)
 */
export async function deleteClinicalNote(req, res, next) {
  try {
    const clinical = await clinicalService.deleteClinicalNote(req.params.id);
    // Audit Trail
    await attachAudit(req, {
      action: AUDIT_ACTIONS.CLINICAL_NOTE_DELETE,
      entity: 'clinical',
      entityId: clinical.id,
      metadata: { deleted: true, deletedBy: req.user.id },
    });

    return ok(res, { id: clinical.id }, 'Clinical note REMOVED');
  } catch (err) {
    next(err);
  }
}