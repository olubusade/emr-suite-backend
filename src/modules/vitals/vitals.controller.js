import { ok, created, error, fail, notFound } from '../../shared/utils/response.js';
import { attachAudit } from '../../shared/middlewares/audit.middleware.js';
import * as vitalsService from './vitals.service.js';

/**
 * VITALS CONTROLLER
 * Manages the capture and retrieval of physiological measurements.
 * Critical for baseline assessment and emergency triage.
 */

/**
 * List all vitals (System-wide view for reporting)
 */
export async function listVitals(req, res, next) {
  try {
    const vitals = await vitalsService.listVitals(req.query);
    return ok(res, vitals,'Vitals list retrieved');
  } catch (err) {
    
    next(err);
  }
}
/**
 * Get a specific vital entry by ID
 */
export async function getVital(req, res, next) {
  try {
    const vital = await vitalsService.getVitalById(req.params.id);
    if (!vital) {
      return next(new Error('Vitals record not found'));
    }
    
    return ok(res, vital);
  } catch (err) {
    next(err);
  }
}

export async function getVitalsByPatient(req, res, next) {
  try {
    const { patientId } = req.params;
    if (!patientId) { 
       return next(new Error('Patient ID is required'));
    } 

    const history = await vitalsService.getVitalsByPatientId(patientId);
    return ok(res, history, 'Patient vitals history retrieved');
  } catch (err) {
    next(err);
  }
}
/**
 * Get vitals specifically captured during a specific visit
 */
export async function getVitalsByAppointment(req, res, next) {
  try {
    const { appointmentId } = req.params;
    const { patientId } = req.query;
    
    if (!appointmentId || !patientId) {
       return next(new Error('Patient ID and Appointment ID are required'));
    }

    const data = { appointmentId, patientId };
    const history = await vitalsService.getVitalsByAppointment(data);
    
    if (!history) { 
         return next(new Error('No vitals found for this specific visit'));
    }

    return ok(res, history);
  } catch (err) {
    next(err);
  }
}

/**
 * Record new vitals (Triaging)
 */
export async function createVital(req, res, next) {
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
    next(err);
  }
}
/**
 * Update a vital entry (Correcting a typo)
 */
export async function updateVital(req, res, next) {
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
    next(err);
  }
}

/**
 * Delete a vital entry
 */
export async function deleteVital(req, res, next) {
  try {
    const vitalId = req.params.id;
    if (!vitalId) { 
       return next(new Error('Vital Id is required'));
    }
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
    next(err);
  }
}