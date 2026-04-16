import * as billService from './bill.service.js';
import { ok, created, error } from '../../shared/utils/response.js';
import { attachAudit } from '../../shared/middlewares/audit.middleware.js';
import { logger } from '../../config/logger.js';
import { AUDIT_ACTIONS } from '../../constants/index.js';
/**
 * BILL CONTROLLER
 * Manages the Revenue Cycle Management (RCM) workflow.
 * Links clinical encounters (Appointments) to financial obligations.
 */

/**
 * List all bills with pagination and search
 */
export async function listBills(req, res) {
  
    const { page, limit, search } = req.query;
    
    const result = await billService.listBills({
      page: parseInt(page, 10) || 1,
      pageSize: parseInt(limit, 10) || 50,
      search
    });
  
    await attachAudit(req, { 
      action: AUDIT_ACTIONS.BILL_READ, 
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
      details:bill.details,
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
  
}
/**
 * Retrieve patient records specifically with wrt 'unpaid' or 'pending' bills
 */
export async function getPendingBills(req, res) {
  
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

}
/**
 * Create a new bill
 */
export async function createBill(req, res) {
  const billData = {
    ...req.body,
    createdBy: req.user.id,
  };

  logger.info(
    `User ${req.user.id} creating bill for appointment ${billData.appointmentId}`
  );

  const bill = await billService.createBill(billData);

  await attachAudit(req, {
    action: AUDIT_ACTIONS.BILL_CREATE,
    entity: 'bill',
    entityId: bill.id,
    metadata: { query: billData },
  });

  return created(
    res,
    {
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
    },
    'Bill created successfully'
  );
}

/**
 * Update bill status or details (e.g. paid status update)
 */
export async function updateBill(req, res) {
  
    if (!req.params.id) { 
       return next(new Error('Missing billing id'));
    }
    const billId = req.params.id;
    const before = await billService.getBill(billId);
    // TECH LOG: Track the start of the operation
    logger.info(`Attempting to update Bill ${billId} by user ${userId}`);
    const bill = await billService.updateBill(billId, req.body,req.user.id);

    await attachAudit(req, { 
      action: AUDIT_ACTIONS,
      entity: 'bill', 
      entityId: bill.id, 
      before,
      after:bill,
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
}
/**
 * GET single bill by ID
 */
export async function getBill(req, res) {
  
    const billId = req.params.id;
    const bill = await billService.getBill(billId);

    if (!bill) return error(res, 404, 'Bill not found');

    await attachAudit(req, { 
      action: AUDIT_ACTIONS.BILL_READ, 
      entity: 'bill', 
      entityId: billId, 
      metadata: { query: req.query } 
    });

    return ok(res, bill, 'Bill retrieved successfully');
}
/**
 * Delete a bill
 */
export async function deleteBill(req, res) {
  
    const billId = req.params.id;

     await attachAudit(req, { 
      action: AUDIT_ACTIONS.BILL_CANCEL, 
      entity: 'bill', 
      entityId: billId, 
      metadata: { query: req.params } 
    });


    return ok(res, { success: true }, 'Bill deleted successfully');

}




