import * as patientService from './patient.service.js';
import { ok, created, error } from '../../shared/utils/response.js';
import { attachAudit } from '../../shared/middlewares/audit.middleware.js'; // Assuming this middleware is correctly defined
import { AUDIT_ACTIONS } from '../../constants/index.js';

/**
 * PATIENT CONTROLLER
 * Manages the Patient Master Index (PMI).
 * This is the primary entity linked to clinical encounters and billing.
 */

/**
 * List patients with pagination and multi-field search
 * GET /api/v1/patients
 */
export async function listPatients(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.limit, 10) || 20;
    const search = req.query.search || '';

    const data = await patientService.listPatients({ page, pageSize, search });

    // DTO Mapping: Ensures consistent API output regardless of internal DB naming
    const items = data.items.map((p) => ({
      id: p.id,
      firstName: p.firstName, 
      lastName: p.lastName,   
      email: p.email,
      phone: p.phone,
      dob: p.dob,
      address:p.address,
      gender: p.gender,
      maritalStatus: p.maritalStatus,
      role: p.role,
      bloodGroup: p.bloodGroup,
      genotype: p.genotype,
      nationality: p.nationality,
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return ok(res, items, 'Patients retrieved successfully', {
      page: data.page,
      pages: data.pages,
      total: data.total
    });
  } catch (err) {    
    return error(res, 500, err.message || 'Server error');
  }
}

/**
 * Register a new patient
 * POST /api/v1/patients
 */
export async function createPatient(req, res, next) {
  try {
    // Inject the creator's ID for audit/tracking
    const dataWithCreator = { ...req.body, createdBy: req.user.id }; 
    
    const patient = await patientService.createPatient(dataWithCreator);
    
    // Audit Trail
    await attachAudit(req, {
      action: AUDIT_ACTIONS.PATIENT_REGISTRATION,
      entity: 'patient',
      entityId: patient.id,
      metadata: { name: `${patient.firstName} ${patient.lastName}`, email: patient.email },
    });
    
    //Return consistent camelCase fields
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
    
    next(err);
  }
}

/**
 * Update patient demographics or medical basics
 * PUT /api/v1/patients/:id
 */
export async function updatePatient(req, res, next) {
  try {
    const { id } = req.params;
    if (!id) { 
      return next(new Error('Patient ID is required'));
    }

    const before = await patientService.getPatientById(id);

    const updated = await patientService.updatePatient(id, req.body);

    await attachAudit(req, {
      action: AUDIT_ACTIONS.PATIENT_RECORD_UPDATE,
      entity: 'patient',
      entityId: id,
      before,
      after: updated
    });

    return ok(res, updated, 'Patient record updated');

  } catch (err) {
    next(err);
  }
}

/**
 * Delete a patient (Note: Service layer should handle soft-delete/anonymization)
 * DELETE /api/v1/patients/:id
 */
export async function deletePatient(req, res, next) {
  try {
    const { id } = req.params;
    if (!id) { 
      return next(new Error('Patient ID is required'));
    }
    await patientService.deletePatient(id);
    
    // Audit Trail
    await attachAudit(req, {
      action: AUDIT_ACTIONS.PATIENT_RECORD_DELETE,
      entity: 'patient',
      entityId: id,
      metadata: { deletedBy: req.user.id },
    });

    return ok(res, { success: true }, 'Patient removed successfully');
  } catch (err) {
    next(err);
  }
}
/**
 * Retrieve full patient profile
 * GET /api/v1/patients/:id
 */
export async function getPatient(req, res, next) {
  try {
    const { id } = req.params;
    if (!id) { 
      return next(new Error('Patient ID is required'));
    }
    const patient = await patientService.getPatientById(id);

    if (!patient) {
      return error(res, 409, 'Patient not found');
    }

    return ok(res, patient, 'Patient profile retrieved');
  } catch (err) {
    next(err);
  }
}