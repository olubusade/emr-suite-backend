import { ok, created, error } from '../../shared/utils/response.js';
import { attachAudit } from '../../shared/middlewares/audit.middleware.js';
import * as clinicalService from './clinical.service.js';
import { AUDIT_ACTIONS } from '../../constants/index.js';
import ApiError from '../../shared/utils/ApiError.js';
import { canAccessClinical } from '../../shared/access/access.engine.js';
import app from '../../app.js';
/**
 * CLINICAL CONTROLLER
 * Manages patient encounter documentation. 
 * This data represents the core medical record and requires strict auditability.
 */

/**
 * List clinical notes with pagination
 */
export async function listClinicalNotes(req, res) {
  
    const limit = req.query.limit;
    const result = await clinicalService.listClinicalNotes({ limit });
    return ok(res, result);
}

/**
 * Get single clinical note by ID
 */
export async function getClinicalNotes(req, res) {
  const noteId = req.params.id;
  if (!noteId) {
      throw new ApiError(400, 'Missing clinical note id');
  }
  const clinical = await clinicalService.getClinicalNotesById(noteId);
  if (!clinical) {
    throw new ApiError('Clinical note not found');
  }
  return ok(res, clinical);
}
/**
 * Get all clinical notes for a specific patient (Medical History)
 * BTG + RBAC protected access
 */
export async function getClinicalNotesByPatientId(req, res) {
  const { patientId } = req.params;

  if (!patientId) {
    throw new ApiError(400, 'Patient ID is required');
  }

  // 🔐 ACCESS DECISION
  const access = await canAccessClinical({
    userId: req.user.id,
    patientId
  });

  if (!access.allowed) {
    throw new ApiError(403, 'Access denied to clinical records');
  }

  const history =
    await clinicalService.getClinicalNotesByPatientId(patientId);

  return ok(
    res,
    history,
    'OK',
    {
      accessMode: access.btgActive ? 'BREAK_GLASS' : 'NORMAL',
      btgActive: !!access.btgActive,
      expiresAt: access.expiresAt,
      grantedBy: access.grantedBy,
      approvedAt: access.approvedAt,
      btgId: access.btgId,
      reason: access.reason
    }
  );
}
/**
 * Get clinical note for a specific appointment
 */
export async function getClinicalNotesByAppointment (req, res) {
   
  const { appointmentId } = req.params;
  const { patientId } = req.query;
  if (!appointmentId) { 
    throw new ApiError('Appointment ID is required');
  }

  if (!patientId) { 
    return next(new Error('Patient ID is required'));
  } 
  const data = { appointmentId, patientId };
  const history = await clinicalService.getClinicalNotesByAppointmentId(data);
  return ok(res, history);
  
}
/**
 * Create clinical note (Doctor/Nurse Encounter)
 */
export async function createClinicalNote(req, res) {
  
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
  
}

/**
 * Update clinical note
 */
export async function updateClinicalNote(req, res) {
  
  const noteId = req.params.id;
  if (!noteId) {
      throw new ApiError(400, 'Missing clinical note id');
  }
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
}

/**
 * Delete clinical note (Soft Delete recommended in Service layer)
 */
export async function deleteClinicalNote(req, res) {
  const noteId = req.params.id;
  if (!noteId) {
      throw new ApiError(400, 'Missing clinical note id');
  }
  const clinical = await clinicalService.deleteClinicalNote(noteId);
  
  // Audit Trail
  await attachAudit(req, {
    action: AUDIT_ACTIONS.CLINICAL_NOTE_DELETE,
    entity: 'clinical',
    entityId: clinical.id,
    metadata: { deleted: true, deletedBy: req.user.id },
  });

  return ok(res, { id: clinical.id }, 'Clinical note REMOVED');
  
}