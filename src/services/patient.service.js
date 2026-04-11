import { Patient } from '../models/index.js';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import * as myLibrary from '../utils/myLibrary.js';
import { reportError } from '../utils/monitoring.js';
import ApiError from '../utils/ApiError.js';
/**
 * PATIENT SERVICE
 * Manages the lifecycle of patient identities and demographic data.
 * Adheres to strict field immutability and data sanitization.
 */

/**
 * List patients with pagination and multi-field search
 */
export async function listPatients({ page = 1, pageSize = 20, search }) {
  try {
      const pageInt = Number(page) || 1;
      const limitInt = Number(pageSize) || 20;
      const offset = (pageInt - 1) * limitInt;

      
      const where = search
        ? {
            [Op.or]: [
              { firstName: { [Op.iLike]: `%${search}%` } },
              { lastName: { [Op.iLike]: `%${search}%` } },
              { email: { [Op.iLike]: `%${search}%` } },
            ],
          }
        : {};

      const { count, rows } = await Patient.findAndCountAll({
        where,
        limit: limitInt,
        offset,
        order: [['created_at', 'DESC']],
        attributes: { exclude: ['password', 'role', 'national_id'] } 
      });

      return {
        items:rows,
        total: count,
        page: pageInt,
        pages: Math.ceil(count / limitInt)
      };
   }catch (err) {
      reportError(err, { service: 'PatientService', operation: 'listPatients' });
      throw err;
  }
  
}

/**
 * Register a new patient with auto-generated credentials
 */
export async function createPatient(data) {
  
  try {
    //Auto generate Password and hashing
    const tempPassword = myLibrary.generateTempPassword(10);

    //ENFORCEMENT: Salt rounds = 10 for optimal security/performance balance
    data.password = await bcrypt.hash(tempPassword, 10);
    
    // Ensure the role is set to the default patient role
    data.role = 'patient'; 
    data.mustChangePassword = true; 
    
    const patient = await Patient.create(data);
    
    //CLEAN RESPONSE: Use toJSON and remove password
    const patientData = patient.toJSON();
    delete patientData.password;

    return patientData;
  } catch (err) {
    reportError(err, { service: 'PatientService', operation: 'createPatient', email: data.email });
    throw err;
  }
  
}

/**
 * Update an existing patient
 */
export async function updatePatient(id, data) {
  
  try {
    const patient = await Patient.findByPk(id);
    if (!patient) throw new ApiError(404, 'Patient not found');
    
    //CRITICAL: Define IMMUTABLE FIELDS - These cannot be changed via general update
    const immutableFields = ['id', 'email', 'role', 'createdBy', 'createdAt', 'nationalId']; 

    //SECURITY: Handle password hashing if provided
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    Object.keys(data).forEach(key => {
      //IMMUTABILITY CHECk
      if (immutableFields.includes(key) || immutableFields.includes(patient.rawAttributes[key]?.field || key)) return; 
      
      if (key in patient) patient[key] = data[key];
    });

    await patient.save();
    
    const patientData = patient.toJSON();
    delete patientData.password;

    return patientData;
  } catch (err) {
    reportError(err, { service: 'PatientService', operation: 'updatePatient', patientId: id });
    throw err;
  }
}

/**
 * Hard delete a patient record
 */
export async function deletePatient(id) {
  try {
    const deleted = await Patient.destroy({ where: { id } });
    if (!deleted) throw new ApiError(404, 'Patient not found');
    return true;
  } catch (err) {
    reportError(err, { service: 'PatientService', operation: 'deletePatient', patientId: id });
    throw err;
  }
}

/**
 * Retrieves a single patient by ID.
 * @param {string} id - The UUID of the patient.
 * @returns {Promise<object | null>} The patient object without the password, or null if not found.
 */
export async function getPatientById(id) {
  try {
    const patient = await Patient.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    return patient ? patient.toJSON() : null;
  } catch (err) {
    reportError(err, { service: 'PatientService', operation: 'getPatientById', patientId: id });
    throw err;
  }
}