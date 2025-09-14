import { ok, created, error } from '../utils/response.js';
import { attachAudit } from '../middlewares/audit.middleware.js';
import * as clinicalService from '../services/clinical.service.js';

/**
 * List clinical notes
 */
export async function listClinicalNotes(req, res) {
  try {
    const limit = req.query.limit;
    const clinicals = await clinicalService.listClinicalNotes({ limit });
    return ok(res, clinicals);
  } catch (err) {
    return error(res, 500, 'Server error', err.message);
  }
}

/**
 * Get single clinical note
 */
export async function getClinicalNotes(req, res) {
  try {
    const clinical = await clinicalService.getClinicalNotesById(req.params.id);
    if (!clinical) return error(res, 404, 'Clinical note not found');
    return ok(res, clinical);
  } catch (err) {
    return error(res, 500, 'Server error', err.message);
  }
}

/**
 * Create clinical note
 */
export async function createClinicalNote(req, res) {
  try {
    const clinical = await clinicalService.createClinicalNote(req.body);

    await attachAudit(req, {
      action: 'CREATE_CLINICAL',
      entity: 'clinical',
      entityId: clinical.id,
      metadata: { ...req.body },
    });

    return created(res, clinical, 'Clinical note created');
  } catch (err) {
    return error(res, 400, 'Error creating clinical note', err.message);
  }
}

/**
 * Update clinical note
 */
export async function updateClinicalNote(req, res) {
  try {
    const clinical = await clinicalService.updateClinicalNote(req.params.id, req.body);

    await attachAudit(req, {
      action: 'UPDATE_CLINICAL',
      entity: 'clinical',
      entityId: clinical.id,
      metadata: { ...req.body },
    });

    return ok(res, clinical);
  } catch (err) {
    return error(res, 400, 'Error updating clinical note', err.message);
  }
}

/**
 * Delete clinical note
 */
export async function deleteClinicalNote(req, res) {
  try {
    const clinical = await clinicalService.deleteClinicalNote(req.params.id);

    await attachAudit(req, {
      action: 'DELETE_CLINICAL',
      entity: 'clinical',
      entityId: clinical.id,
      metadata: { deleted: true },
    });

    return ok(res, { id: clinical.id }, 'Clinical note deleted');
  } catch (err) {
    return error(res, 400, 'Error deleting clinical note', err.message);
  }
}
