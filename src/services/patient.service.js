import { Patient } from '../models/index.js';
import { Op } from 'sequelize';
import ApiError from '../utils/ApiError.js';

/**
 * List patients with pagination and optional search
 */
export async function listPatients({ page = 1, pageSize = 20, search }) {
  const pageInt = Number(page) || 1;
  const limitInt = Number(pageSize) || 20;
  const offset = (pageInt - 1) * limitInt;

  const where = search
    ? { fullName: { [Op.iLike]: `%${search}%` } }
    : {};

  const { count, rows } = await Patient.findAndCountAll({
    where,
    limit: limitInt,
    offset,
    order: [['created_at', 'DESC']]
  });

  const items = rows.map(p => ({
    id: p.id,
    fname: p.fname,
    lname: p.lname,
    email: p.email,
    phone: p.phone,
    dob: p.dob,
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
  const patient = await Patient.create(data);

  return {
    id: patient.id,
    fname: patient.fname,
    lname: patient.lname,
    email: patient.email,
    phone: patient.phone,
    dob: patient.dob,
    createdAt: patient.createdAt,
    updatedAt: patient.updatedAt
  };
}

/**
 * Update an existing patient
 */
export async function updatePatient(id, data) {
  const patient = await Patient.findByPk(id);
  if (!patient) throw new ApiError(404, 'Patient not found');

  Object.keys(data).forEach(key => {
    if (key in patient) patient[key] = data[key];
  });

  await patient.save();

  return {
    id: patient.id,
    fname: patient.fname,
    lname: patient.lname,
    email: patient.email,
    phone: patient.phone,
    dob: patient.dob,
    createdAt: patient.createdAt,
    updatedAt: patient.updatedAt
  };
}

/**
 * Delete a patient
 */
export async function deletePatient(id) {
  const deleted = await Patient.destroy({ where: { id } });
  if (!deleted) throw new ApiError(404, 'Patient not found');
  return true;
}
