import * as patientService from '../services/patient.service.js';
import { ok, created, error } from '../utils/response.js';
import { attachAudit } from '../middlewares/audit.middleware.js'; // Assuming this middleware is correctly defined

/**
 * List patients with pagination and optional search
 */
export async function listPatients(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.limit, 10) || 20;
    const search = req.query.search || '';

    const data = await patientService.listPatients({ page, pageSize, search });

    // Map DB fields to camelCase (Service should return clean objects)
    const items = data.items.map((patient) => ({
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phone: patient.phone,
      dob: patient.dob,
      gender: patient.gender,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    }));

    return ok(res, items, 'Patients retrieved successfully', {
      page: data.page,
      pages: data.pages,
      total: data.total
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
    // 🔑 Inject the creator's ID for audit/tracking
    const dataWithCreator = { ...req.body, createdBy: req.user.id }; 
    
    const patient = await patientService.createPatient(dataWithCreator);
    
    // 🔑 Audit Trail
    await attachAudit(req, {
      action: 'PATIENT_CREATE',
      entity: 'patient',
      entityId: patient.id,
      metadata: { ...req.body, creatorId: req.user.id },
    });

    // 🔑 FIX: Return consistent camelCase fields
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
    
    // 🔑 Audit Trail
    await attachAudit(req, {
      action: 'PATIENT_UPDATE',
      entity: 'patient',
      entityId: id,
      metadata: { ...req.body, updaterId: req.user.id },
    });

    // 🔑 FIX: Return consistent camelCase fields
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
    
    // 🔑 Audit Trail
    await attachAudit(req, {
      action: 'PATIENT_DELETE',
      entity: 'patient',
      entityId: id,
      metadata: { deleterId: req.user.id },
    });

    return ok(res, { success: true }, 'Patient deleted successfully');
  } catch (err) {
    console.error('patients.delete', err);
    return error(res, err.statusCode || 500, err.message || 'Server error');
  }
}

export async function getPatient(req, res) {
  try {
    const { id } = req.params;
    const patient = await patientService.getPatientById(id);

    if (!patient) {
      return error(res, 404, 'Patient not found');
    }

    return ok(res, patient, 'Patient retrieved successfully');
  } catch (err) {
    console.error('patients.get', err);
    return error(res, err.statusCode || 500, err.message || 'Server error');
  }
}