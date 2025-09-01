import * as patientService from '../services/patient.service.js';
import { ok, created, error } from '../utils/response.js';
import { attachAudit } from '../middlewares/audit.middleware.js';

/**
 * List patients with pagination and optional search
 */
export async function listPatients(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.limit, 10) || 20;
    const search = req.query.search || '';

    const data = await patientService.listPatients({ page, pageSize, search });

    // Map DB fields to camelCase
    const items = data.items.map((patient) => ({
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phone: patient.phone,
      dob: patient.dob,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    }));

    return ok(res, items, 'Patients retrieved successfully', {
      page: data.page,
      pages: data.pages,
      total: data.total,
    });
  } catch (err) {
    console.error('patients.list', err);
    return error(res, 500, err.message || 'Server error');
  }
}

/**
 * Create a new patient
 */
export async function createPatient(req, res) {
  try {
    const patient = await patientService.createPatient(req.body);
    await attachAudit(req, 'CREATE_PATIENT', 'patient', patient.id, req.body);

    return created(res, {
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phone: patient.phone,
      dob: patient.dob,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    }, 'Patient created successfully');
  } catch (err) {
    console.error('patients.create', err);
    return error(res, err.statusCode || 500, err.message || 'Server error');
  }
}

/**
 * Update an existing patient
 */
export async function updatePatient(req, res) {
  try {
    const { id } = req.params;
    const patient = await patientService.updatePatient(id, req.body);
    await attachAudit(req, 'UPDATE_PATIENT', 'patient', id, req.body);

    return ok(res, {
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phone: patient.phone,
      dob: patient.dob,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    }, 'Patient updated successfully');
  } catch (err) {
    console.error('patients.update', err);
    return error(res, err.statusCode || 500, err.message || 'Server error');
  }
}

/**
 * Delete a patient
 */
export async function deletePatient(req, res) {
  try {
    const { id } = req.params;
    await patientService.deletePatient(id);
    await attachAudit(req, 'DELETE_PATIENT', 'patient', id);

    return ok(res, { success: true }, 'Patient deleted successfully');
  } catch (err) {
    console.error('patients.delete', err);
    return error(res, err.statusCode || 500, err.message || 'Server error');
  }
}
