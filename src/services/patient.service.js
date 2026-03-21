import { Patient } from '../models/index.js';
import { Op } from 'sequelize';
import ApiError from '../utils/ApiError.js';
import bcrypt from 'bcrypt';
import * as myLibrary from '../utils/myLibrary.js';

/**
 * List patients with pagination and optional search
 */
export async function listPatients({ page = 1, pageSize = 20, search }) {
  const pageInt = Number(page) || 1;
  const limitInt = Number(pageSize) || 20;
  const offset = (pageInt - 1) * limitInt;

  // The 'where' clause relies on the 'fullName' getter method from the model
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
    // 🛡️ SECURITY: Exclude sensitive fields from the list query
    attributes: { exclude: ['password', 'role', 'national_id'] } 
  });

  console.log('rows::',rows);
  const items = rows.map(p => ({
    id: p.id,
    firstName: p.firstName, // 🔑 Consistent naming
    lastName: p.lastName,   // 🔑 Consistent naming
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
    updatedAt: p.updatedAt
  }));

  return {
    items,
    total: count,
    page: pageInt,
    pages: Math.ceil(count / limitInt)
  };
}

/**
 * Create a new patient
 */
export async function createPatient(data) {
  //Auto generate Password and hashing

  const tempPassword = myLibrary.generateTempPassword(10);


  data.password = await bcrypt.hash(tempPassword, 10);
  
  // Ensure the role is set to the default patient role
  data.role = 'patient'; 
  data.mustChangePassword = true; 
  
  const patient = await Patient.create(data);
  
  // 🔑 CLEAN RESPONSE: Use toJSON and remove password
  const patientData = patient.toJSON();
  delete patientData.password;

  return patientData;
}

/**
 * Update an existing patient
 */
export async function updatePatient(id, data) {
  const patient = await Patient.findByPk(id);
  if (!patient) throw new ApiError(404, 'Patient not found');
  
  //CRITICAL: Define IMMUTABLE FIELDS
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
}

/**
 * Delete a patient (Soft Delete is recommended, but using hard delete per current function)
 */
export async function deletePatient(id) {
  const deleted = await Patient.destroy({ where: { id } });
  if (!deleted) throw new ApiError(404, 'Patient not found');
  return true;
}

/**
 * Retrieves a single patient by ID.
 * @param {string} id - The UUID of the patient.
 * @returns {Promise<object | null>} The patient object without the password, or null if not found.
 */
export async function getPatientById(id) {
  const patient = await Patient.findByPk(id, {
    attributes: { exclude: ['password'] }
  });

  if (!patient) {
    return null;
  }

  return patient.toJSON();
}