import { Bill, Patient } from '../models/index.js';
import ApiError from '../utils/ApiError.js';

export async function listBills({ page = 1, pageSize = 50 }) {
  const limit = parseInt(pageSize, 10);
  const offset = (parseInt(page, 10) - 1) * limit;

  const { count, rows } = await Bill.findAndCountAll({
    include: [{ model: Patient, attributes: ['id', 'full_name'] }],
    order: [['created_at', 'DESC']],
    limit,
    offset
  });

  return { total: count, rows, page: parseInt(page, 10), pageSize: limit };
}

export async function createBill({ patient_id, amount, status }) {
  const patient = await Patient.findByPk(patient_id);
  if (!patient) throw new ApiError(400, 'Patient not found');

  const bill = await Bill.create({
    patient_id,
    amount,
    status: status || 'PENDING'
  });

  return bill;
}

export async function updateBill(id, changes) {
  const bill = await Bill.findByPk(id);
  if (!bill) throw new ApiError(404, 'Bill not found');

  Object.assign(bill, changes);
  await bill.save();

  return bill;
}

export async function deleteBill(id) {
  const deleted = await Bill.destroy({ where: { id } });
  if (!deleted) throw new ApiError(404, 'Bill not found');

  return true;
}
