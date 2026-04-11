import * as billService from '../services/bill.service.js';
import { ok, created, error } from '../utils/response.js';
import { attachAudit } from '../middlewares/audit.middleware.js';
import { logger } from '../config/logger.js';
/**
 * BILL CONTROLLER
 * Manages the Revenue Cycle Management (RCM) workflow.
 * Links clinical encounters (Appointments) to financial obligations.
 */

/**
 * List all bills with pagination and search
 */
export async function listBills(req, res) {
  try {
    const { page, limit, search } = req.query;
    
    const result = await billService.listBills({
      page: parseInt(page, 10) || 1,
      pageSize: parseInt(limit, 10) || 50,
      search
    });
  
    await attachAudit(req, { 
      action: 'BILL_LIST_VIEW', 
      entity: 'bill', 
      entityId: req.user.id, // ID of the staff performing the action
      metadata: {
        query: req.query,
        filters: search,
        resultCount: result.rows.length
      } 
    });

    // Map DB snake_case to camelCase
    const rows = result.rows.map((bill) => ({
      id: bill.id,
      patientId: bill.patientId,
      appointmentId: bill.appointmentId,
      paymentMethod: bill.paymentMethod,
      patient:bill.patient,
      amount: bill.amount,
      status: bill.status,
      dueDate: bill.dueDate,
      createdAt: bill.createdAt,
      updatedAt: bill.updatedAt,
      staff: bill.staff,     
      details: bill.details
    }));

    return ok(res, rows, 'Bills retrieved successfully', {
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      pages: Math.ceil(result.total / result.pageSize),
    });
  } catch (err) {
    return error(res, 500, err.message || 'Server error');
  }
}
/**
 * Retrieve patient records specifically with wrt 'unpaid' or 'pending' bills
 */
export async function getPendingBills(req, res) {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    const result = await billService.getPendingBills({
      page: parseInt(page, 10),
      pageSize: parseInt(limit, 10),
      search: search.trim()
    });

    // Using your 'ok' utility function
    return ok(res, result.items, 'Pending Bills retrieved successfully', {
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      pages: Math.ceil(result.total / result.pageSize),
    });
  } catch (err) {    
    return error(res, 500, 'Unable to retrieve pending bills at this time');
  }
}
/**
 * Create a new bill
 */
export async function createBill(req, res) {
  try {
    const billData = {
      ...req.body,
      createdBy: req.user.id // 🛡️ Secure: comes from JWT
    };

    //LOGGER info
    logger.info(`REST Request: User ${req.user.id} is creating a bill for Appointment ${billData.appointmentId}`);
    const bill = await billService.createBill(billData);
    
     await attachAudit(req, { 
      action: 'BILL_CREATE', 
      entity: 'bill', 
      entityId: bill.id, 
      metadata: { query: billData } 
      
    });

    return created(res, {
      id: bill.id,
      customerId: bill.customerId,
      amount: bill.amount,
      status: bill.status,
      dueDate: bill.dueDate,
      paymentMethod: bill.paymentMethod,
      notes: bill.notes,
      createdAt: bill.createdAt,
      createdBy: bill.createdBy,
      updatedAt: bill.updatedAt,
    }, 'Bill created successfully');
  } catch (err) {
    //LOGGER (Error)
    logger.error(`REST Error: Failed to create bill - ${err.message}`, { 
      stack: err.stack, 
      path: req.originalUrl 
    });
    return error(res, err.statusCode || 500, err.message || 'Server error');
  }
}

/**
 * Update bill status or details (e.g. paid status update)
 */
export async function updateBill(req, res) {
  try {
    // TECH LOG: Track the start of the operation
    logger.info(`Attempting to update Bill ${id} by user ${userId}`);
    const bill = await billService.updateBill(req.params.id, req.body,req.user.id);

    await attachAudit(req, { 
      action: 'BILL_UPDATE', 
      entity: 'bill', 
      entityId: bill.id, 
      metadata: { query: req.body } 
    });

    return ok(res, {
      id: bill.id,
      customerId: bill.customerId,
      amount: bill.amount,
      status: bill.status,
      dueDate: bill.dueDate,
      paymentMethod: bill.paymentMethod,
      notes: bill.notes,
      createdAt: bill.createdAt,
      updatedAt: bill.updatedAt,
    }, 'Bill updated successfully');
  } catch (err) {
    return error(res, err.statusCode || 500, err.message || 'Server error');
  }
}
/**
 * GET single bill by ID
 */
export async function getBill(req, res) {
  try {
    const billId = req.params.id;
    const bill = await billService.getBill(billId);

    if (!bill) return error(res, 404, 'Bill not found');

    await attachAudit(req, { 
      action: 'BILL_DETAIL_VIEW', 
      entity: 'bill', 
      entityId: billId, 
      metadata: { query: req.query } 
    });

    return ok(res, bill, 'Bill retrieved successfully');
  } catch (err) {
    return error(res, err.statusCode || 500, err.message || 'Server error');
  }
}
/**
 * Delete a bill
 */
export async function deleteBill(req, res) {
  try {
    const billId = req.params.id;

     await attachAudit(req, { 
      action: 'DELETE_BILL', 
      entity: 'bill', 
      entityId: billId, 
      metadata: { query: req.params } 
    });


    return ok(res, { success: true }, 'Bill deleted successfully');
  } catch (err) {
    return error(res, err.statusCode || 500, err.message || 'Server error');
  }
}




