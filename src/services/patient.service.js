import { Patient } from '../models/index.js';
import { Op } from 'sequelize';

export async function listPatients({ page = 1, limit = 20, search }) {
  const offset = (page - 1) * limit;
  const where = search
    ? { fullName: { [Op.iLike]: `%${search}%` } }
    : {};

  const { count, rows } = await Patient.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']]
  });

  return {
    items: rows,
    total: count,
    page,
    pages: Math.ceil(count / limit)
  };
}

export async function createPatient(data) {
  return Patient.create(data);
}

export async function updatePatient(id, data) {
  const patient = await Patient.findByPk(id);
  if (!patient) throw { statusCode: 404, message: 'Patient not found' };
  Object.assign(patient, data);
  await patient.save();
  return patient;
}

export async function deletePatient(id) {
  const deleted = await Patient.destroy({ where: { id } });
  if (!deleted) throw { statusCode: 404, message: 'Patient not found' };
  return true;
}
