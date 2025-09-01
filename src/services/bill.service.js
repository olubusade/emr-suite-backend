import { Bill, Patient } from '../models/index.js';
import ApiError from '../utils/ApiError.js';

/**
 * List bills with pagination
 */
export async function listBills({ page = 1, pageSize = 50, filters = {} }) {
  const limit = Number(pageSize) || 50;
  const offset = (Number(page) - 1) * limit;

  // Build where clause dynamically from filters
  const where = {};
  if (filters.patientId) where.patientId = filters.patientId;
  if (filters.status) where.status = filters.status;

  const { count, rows } = await Bill.findAndCountAll({
    where,
    include: [{ model: Patient, attributes: ['id', 'full_name'] }],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  const mappedRows = rows.map((bill) => ({
    id: bill.id,
    patientId: bill.patientId,
    amount: bill.amount,
    status: bill.status,
    createdAt: bill.createdAt,
    updatedAt: bill.updatedAt,
    patient: bill.Patient
      ? { id: bill.Patient.id, fullName: bill.Patient.full_name }
      : null,
  }));

  return {
    total: count,
    rows: mappedRows,
    page: Number(page),
    pageSize: limit,
    pages: Math.ceil(count / limit),
  };
}

/**
 * Create a new bill
 */
export async function createBill({ patientId, amount, status }) {
  const patient = await Patient.findByPk(patientId);
  if (!patient) throw new ApiError(400, 'Patient not found');

  const bill = await Bill.create({
    patientId,
    amount,
    status: status || 'PENDING',
  });

  // Include patient info in the response
  return {
    id: bill.id,
    patientId: bill.patientId,
    amount: bill.amount,
    status: bill.status,
    createdAt: bill.createdAt,
    updatedAt: bill.updatedAt,
    patient: { id: patient.id, fullName: patient.full_name },
  };
}

/**
 * Update an existing bill
 */
export async function updateBill(id, changes) {
  const bill = await Bill.findByPk(id, { include: Patient });
  if (!bill) throw new ApiError(404, 'Bill not found');

  if (changes.patientId) {
    const patient = await Patient.findByPk(changes.patientId);
    if (!patient) throw new ApiError(400, 'Patient not found');
    bill.patientId = changes.patientId;
  }
  if (changes.amount !== undefined) bill.amount = changes.amount;
  if (changes.status) bill.status = changes.status;

  await bill.save();

  return {
    id: bill.id,
    patientId: bill.patientId,
    amount: bill.amount,
    status: bill.status,
    createdAt: bill.createdAt,
    updatedAt: bill.updatedAt,
    patient: bill.Patient
      ? { id: bill.Patient.id, fullName: bill.Patient.full_name }
      : null,
  };
}

/**
 * Delete a bill
 */
export async function deleteBill(id) {
  const deleted = await Bill.destroy({ where: { id } });
  if (!deleted) throw new ApiError(404, 'Bill not found');
  return true;
}
