import * as billService from '../services/bill.service.js';
import { ok, created, fail, error } from '../utils/response.js';
import { attachAudit } from '../middlewares/audit.middleware.js';

export async function listBills(req, res) {
  try {
    const result = await billService.listBills(req.query);
    await attachAudit(req, 'VIEW_BILL', 'bill', null, { query: req.query });
    return ok(res, result.rows, { total: result.total, page: result.page, pageSize: result.pageSize });
  } catch (err) {
    console.error('bills.list', err);
    return error(res, 500, err.message || 'Server error');
  }
}

export async function createBill(req, res) {
  try {
    const bill = await billService.createBill(req.body);
    await attachAudit(req, 'CREATE_BILL', 'bill', bill.id, req.body);
    return created(res, bill);
  } catch (err) {
    console.error('bills.create', err);
    return error(res, err.statusCode || 500, err.message || 'Server error');
  }
}

export async function updateBill(req, res) {
  try {
    const bill = await billService.updateBill(req.params.id, req.body);
    await attachAudit(req, 'UPDATE_BILL', 'bill', bill.id, req.body);
    return ok(res, bill);
  } catch (err) {
    console.error('bills.update', err);
    return error(res, err.statusCode || 500, err.message || 'Server error');
  }
}

export async function deleteBill(req, res) {
  try {
    await billService.deleteBill(req.params.id);
    await attachAudit(req, 'DELETE_BILL', 'bill', req.params.id);
    return ok(res, { ok: true });
  } catch (err) {
    console.error('bills.delete', err);
    return error(res, err.statusCode || 500, err.message || 'Server error');
  }
}
