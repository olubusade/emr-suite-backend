import { ok, created, error, fail, notFound } from '../utils/response.js';
import { attachAudit } from '../middlewares/audit.middleware.js';
import * as vitalsService from '../services/vitals.service.js';

export async function listVitals(req, res) {
  try {
    const vitals = await vitalsService.listVitals(req.query);
    return ok(res, vitals);
  } catch (err) {
    console.error('vitals.list', err);
    return error(res, 500, 'Server error', err.message);
  }
}

export async function getVital(req, res) {
  try {
    const vital = await vitalsService.getVitalById(req.params.id);
    if (!vital) return error(res, 404, 'Vitals not found');
    return ok(res, vital);
  } catch (err) {
    console.error('vitals.get', err);
    return error(res, 500, 'Server error', err.message);
  }
}

export async function getVitalsByPatient(req, res) {
  const { patientId } = req.params;
  
  if (!patientId) throw new ApiError(400, 'Patient ID is required');
  try { 
    const history = await vitalsService.getVitalsByPatientId(patientId);
    return ok(res, history);
  }catch (err) {
    console.error('vitals.getVitalsByPatient', err);
    return error(res, 500, 'Server error', err.message);
  }
}
export async function getVitalsByAppointment(req, res) {
  const { appointmentId } = req.params;
  const { patientId } = req.query;
  
  if (!appointmentId) throw new ApiError(400, 'Appointment ID is required');

  if (!patientId) throw new ApiError(400, 'Patient ID is required');
  try { 
    const data = { appointmentId, patientId };
    const history = await vitalsService.getVitalsByAppointment(data);
    if (!history) { 
      return notFound(res, 'No vitals found for this specific visit');
    }
    return ok(res, history);
  }catch (err) {
    console.error('vitals.getVitalsByAppointment', err);
    return error(res, 500, 'Server error', err.message);
  }
}


export async function createVital(req, res) {
  try {
    // 🔑 Inject nurseId from the authenticated user
    const vitalData = { 
      ...req.body,
        createdBy:req.user.id,
        nurseId: req.user.id 
    };

    const vital = await vitalsService.createVital(vitalData);

    // 🔑 Audit Trail
    await attachAudit(req, {
      action: 'CREATE_VITAL',
      entity: 'vitals',
      entityId: vital.id,
      metadata: { ...vitalData },
    });

    return created(res, vital, 'Vitals recorded');
  } catch (err) {
    console.error('vitals.create', err);
    return error(res, err.statusCode || 400, 'Error recording vitals', err.message);
  }
}

export async function updateVital(req, res) {
  try {
    const vital = await vitalsService.updateVital(req.params.id, req.body);

    // 🔑 Audit Trail
    await attachAudit(req, {
      action: 'UPDATE_VITAL',
      entity: 'vitals',
      entityId: vital.id,
      metadata: { ...req.body, updaterId: req.user.id },
    });

    return ok(res, vital);
  } catch (err) {
    console.error('vitals.update', err);
    return error(res, err.statusCode || 400, 'Error updating vitals', err.message);
  }
}


export async function deleteVital(req, res) {
  try {
    const deleted = await vitalsService.deleteVital(req.params.id);

    // 🔑 Audit Trail
    await attachAudit(req, {
      action: 'DELETE_VITAL',
      entity: 'vitals',
      entityId: req.params.id,
      metadata: { deleterId: req.user.id },
    });

    return ok(res, { id: deleted.id }, 'Vitals deleted');
  } catch (err) {
    console.error('vitals.delete', err);
    return error(res, err.statusCode || 400, 'Error deleting vitals', err.message);
  }
}