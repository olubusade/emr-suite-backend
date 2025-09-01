import * as billService from '../services/bill.service.js';
import { ok, created, error } from '../utils/response.js';
import { attachAudit } from '../middlewares/audit.middleware.js';

/**
 * List bills
 */
export async function listBills(req, res) {
  try {
    const { page, pageSize, ...filters } = req.query;

    const result = await billService.listBills({
      page: parseInt(page, 10) || 1,
      pageSize: parseInt(pageSize, 10) || 50,
      filters,
    });

    await attachAudit(req, 'VIEW_BILL', 'bill', null, { query: req.query });

    // Map DB snake_case to camelCase
    const rows = result.rows.map((bill) => ({
      id: bill.id,
      customerId: bill.customerId,
      amount: bill.amount,
      status: bill.status,
      dueDate: bill.dueDate,
      createdAt: bill.createdAt,
      updatedAt: bill.updatedAt,
    }));

    return ok(res, rows, 'Bills retrieved successfully', {
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      pages: Math.ceil(result.total / result.pageSize),
    });
  } catch (err) {
    console.error('bills.list', err);
    return error(res, 500, err.message || 'Server error');
  }
}

/**
 * Create a new bill
 */
export async function createBill(req, res) {
  try {
    const bill = await billService.createBill(req.body);
    await attachAudit(req, 'CREATE_BILL', 'bill', bill.id, req.body);

    return created(res, {
      id: bill.id,
      customerId: bill.customerId,
      amount: bill.amount,
      status: bill.status,
      dueDate: bill.dueDate,
      createdAt: bill.createdAt,
      updatedAt: bill.updatedAt,
    }, 'Bill created successfully');
  } catch (err) {
    console.error('bills.create', err);
    return error(res, err.statusCode || 500, err.message || 'Server error');
  }
}

/**
 * Update a bill
 */
export async function updateBill(req, res) {
  try {
    const bill = await billService.updateBill(req.params.id, req.body);
    await attachAudit(req, 'UPDATE_BILL', 'bill', bill.id, req.body);

    return ok(res, {
      id: bill.id,
      customerId: bill.customerId,
      amount: bill.amount,
      status: bill.status,
      dueDate: bill.dueDate,
      createdAt: bill.createdAt,
      updatedAt: bill.updatedAt,
    }, 'Bill updated successfully');
  } catch (err) {
    console.error('bills.update', err);
    return error(res, err.statusCode || 500, err.message || 'Server error');
  }
}

/**
 * Delete a bill
 */
export async function deleteBill(req, res) {
  try {
    const billId = req.params.id;
    await billService.deleteBill(billId);
    await attachAudit(req, 'DELETE_BILL', 'bill', billId);

    return ok(res, { success: true }, 'Bill deleted successfully');
  } catch (err) {
    console.error('bills.delete', err);
    return error(res, err.statusCode || 500, err.message || 'Server error');
  }
}




/**
 * GET /:id
 */
export async function getBill(req, res) {
  try {
    const billId = req.params.id;
    const bill = await billService.getBill(billId);

    if (!bill) return error(res, 404, 'Bill not found');

    await attachAudit(req, 'VIEW_BILL', 'bill', billId);

    return ok(res, bill, 'Bill retrieved successfully');
  } catch (err) {
    console.error('bills.get', err);
    return error(res, err.statusCode || 500, err.message || 'Server error');
  }
}