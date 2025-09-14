import { ok, created, error } from '../utils/response.js';
import { attachAudit } from '../middlewares/audit.middleware.js';
import * as vitalsService from '../services/vitals.service.js';

export async function listVitals(req, res) {
  try {
    const vitals = await vitalsService.listVitals(req.query);
    return ok(res, vitals);
  } catch (err) {
    return error(res, 500, 'Server error', err.message);
  }
}

export async function getVital(req, res) {
  try {
    const vital = await vitalsService.getVitalById(req.params.id);
    if (!vital) return error(res, 404, 'Vitals not found');
    return ok(res, vital);
  } catch (err) {
    return error(res, 500, 'Server error', err.message);
  }
}

export async function createVital(req, res) {
  try {
    const vital = await vitalsService.createVital(req.body);

    await attachAudit(req, {
      action: 'CREATE_VITAL',
      entity: 'vitals',
      entityId: vital.id,
      metadata: { ...req.body },
    });

    return created(res, vital, 'Vitals recorded');
  } catch (err) {
    return error(res, 400, 'Error recording vitals', err.message);
  }
}

export async function updateVital(req, res) {
  try {
    const vital = await vitalsService.updateVital(req.params.id, req.body);

    await attachAudit(req, {
      action: 'UPDATE_VITAL',
      entity: 'vitals',
      entityId: vital.id,
      metadata: { ...req.body },
    });

    return ok(res, vital);
  } catch (err) {
    return error(res, 400, 'Error updating vitals', err.message);
  }
}

export async function deleteVital(req, res) {
  try {
    const deleted = await vitalsService.deleteVital(req.params.id);

    await attachAudit(req, {
      action: 'DELETE_VITAL',
      entity: 'vitals',
      entityId: req.params.id,
    });

    return ok(res, { id: deleted.id }, 'Vitals deleted');
  } catch (err) {
    return error(res, 400, 'Error deleting vitals', err.message);
  }
}
