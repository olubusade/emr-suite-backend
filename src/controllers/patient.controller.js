import * as patientService from '../services/patient.service.js';
import { ok, created, error } from '../utils/response.js';
import { attachAudit } from '../middlewares/audit.middleware.js';

export async function listPatients(req, res) {
  try {
    const { page, limit, search } = req.query;
    const data = await patientService.listPatients({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      search
    });
    return ok(res, data.items, 'OK', { page: data.page, pages: data.pages, total: data.total });
  } catch (err) {
    console.error('patients.list', err);
    return error(res, 500, 'Server error');
  }
}

export async function createPatient(req, res) {
  try {
    const patient = await patientService.createPatient(req.body);
    await attachAudit(req, 'CREATE_PATIENT', 'patient', patient.id, req.body);
    return created(res, patient, 'Created');
  } catch (err) {
    console.error('patients.create', err);
    return error(res, 500, 'Server error');
  }
}

export async function updatePatient(req, res) {
  try {
    const { id } = req.params;
    const updated = await patientService.updatePatient(id, req.body);
    await attachAudit(req, 'UPDATE_PATIENT', 'patient', id, req.body);
    return ok(res, updated, 'Updated');
  } catch (err) {
    console.error('patients.update', err);
    return error(res, err.statusCode || 500, err.message || 'Server error');
  }
}

export async function deletePatient(req, res) {
  try {
    const { id } = req.params;
    await patientService.deletePatient(id);
    await attachAudit(req, 'DELETE_PATIENT', 'patient', id);
    return ok(res, true, 'Deleted');
  } catch (err) {
    console.error('patients.delete', err);
    return error(res, err.statusCode || 500, err.message || 'Server error');
  }
}
