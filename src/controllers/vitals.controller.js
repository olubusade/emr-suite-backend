import { ok, created, error, fail, notFound } from '../utils/response.js';
import { attachAudit } from '../middlewares/audit.middleware.js';
import * as vitalsService from '../services/vitals.service.js';

/**
 * VITALS CONTROLLER
 * Manages the capture and retrieval of physiological measurements.
 * Critical for baseline assessment and emergency triage.
 */

/**
 * List all vitals (System-wide view for reporting)
 */
export async function listVitals(req, res) {
  try {
    const vitals = await vitalsService.listVitals(req.query);
    return ok(res, vitals,'Vitals list retrieved');
  } catch (err) {
    
    return error(res, 500, 'Failed to fetch vitals records', err.message);
  }
}
/**
 * Get a specific vital entry by ID
 */
export async function getVital(req, res) {
  try {
    const vital = await vitalsService.getVitalById(req.params.id);
    if (!vital) return notFound(res, 'Vitals record not found');
    
    return ok(res, vital);
  } catch (err) {
    return error(res, 500, 'Server error fetching vital record');
  }
}

export async function getVitalsByPatient(req, res) {
  try {
    const { patientId } = req.params;
    if (!patientId) return error(res, 400, 'Patient ID is required');

    const history = await vitalsService.getVitalsByPatientId(patientId);
    return ok(res, history, 'Patient vitals history retrieved');
  } catch (err) {
    return error(res, 500, 'Error retrieving patient vital history');
  }
}
/**
 * Get vitals specifically captured during a specific visit
 */
export async function getVitalsByAppointment(req, res) {
  try {
    const { appointmentId } = req.params;
    const { patientId } = req.query;
    
    if (!appointmentId || !patientId) {
      return error(res, 400, 'Appointment ID and Patient ID are required');
    }

    const data = { appointmentId, patientId };
    const history = await vitalsService.getVitalsByAppointment(data);
    
    if (!history) return notFound(res, 'No vitals found for this specific visit');

    return ok(res, history);
  } catch (err) {
    return error(res, 500, 'Error retrieving appointment vitals');
  }
}

/**
 * Record new vitals (Triaging)
 */
export async function createVital(req, res) {
  try {
    // 🔑 Inject nurseId from the authenticated user
    const vitalData = { 
      ...req.body,
        createdBy:req.user.id,
        nurseId: req.user.id 
    };

    const vital = await vitalsService.createVital(vitalData);

    //Audit Trail
    await attachAudit(req, {
      action: 'VITAL_SIGN_RECORD',
      entity: 'vitals',
      entityId: vital.id,
      metadata: { ...vitalData },
    });

    return created(res, vital, 'Vitals recorded');
  } catch (err) {
    return error(res, err.statusCode || 400, 'Error recording vitals', err.message);
  }
}
/**
 * Update a vital entry (Correcting a typo)
 */
export async function updateVital(req, res) {
  try {
    const vital = await vitalsService.updateVital(req.params.id, req.body);

    // Audit Trail
    await attachAudit(req, {
      action: 'VITAL_SIGN_UPDATE',
      entity: 'vitals',
      entityId: vital.id,
      metadata: { ...req.body, updatedBy: req.user.id },
    });

    return ok(res, vital, 'Vitals updated successfully');
  } catch (err) {
    return error(res, err.statusCode || 400, 'Error updating vitals', err.message);
  }
}

/**
 * Delete a vital entry
 */
export async function deleteVital(req, res) {
  try {
    const vitalId = req.params.id;
    await vitalsService.deleteVital(vitalId);

    // Audit Trail
    await attachAudit(req, {
      action: 'VITAL_SIGN_DELETE',
      entity: 'vitals',
      entityId: req.params.id,
      metadata: { deletedBy: req.user.id },
    });

    return ok(res, { id: vitalId }, 'Vitals record removed');
  } catch (err) {
    return error(res, err.statusCode || 400, 'Error deleting vitals', err.message);
  }
}