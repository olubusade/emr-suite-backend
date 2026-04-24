import * as btgService from './btg.service.js';
import { ok, error } from '../../shared/utils/response.js';
import { attachAudit } from '../../shared/middlewares/audit.middleware.js';
import { logger } from '../../config/logger.js';
import { AUDIT_ACTIONS } from '../../constants/index.js';
import { UUID } from 'sequelize';

/**
 * REQUEST BREAK-GLASS (NURSE)
 */
export async function requestBTG(req, res) {
  const { patientId, reason, durationMinutes } = req.body;

  logger.info(
    `User ${req.user.id} requesting BTG access for patient ${patientId}`
  );

  const btg = await btgService.createBTGRequest({
    patientId,
    userId: req.user.id,
    reason,
    durationMinutes
  });

  await attachAudit(req, {
    action: AUDIT_ACTIONS.BREAK_GLASS_REQUEST,
    entity: 'btg_request',
    entityId: btg.id,
    metadata: {
      patientId,
      reason
    }
  });

  return ok(res, {
    id: btg.id,
    patientId: btg.patientId,
    status: btg.status,
    reason: btg.reason,
    createdAt: btg.createdAt
  }, 'BTG request submitted successfully');
}

/**
 * LIST BTG REQUESTS (ADMIN DASHBOARD)
 */
export async function listBTGRequests(req, res) {
  const {
    page = 1,
    limit = 20,
    status,
    patientId,
    requestedBy,
    startDate,
    endDate
  } = req.query;

  const result = await btgService.listBTGRequests({
    page: parseInt(page, 10),
    pageSize: parseInt(limit, 10),
    status,
    patientId,
    requestedBy,
    startDate,
    endDate
  });

  await attachAudit(req, {
    action: AUDIT_ACTIONS.BREAK_GLASS_READ,
    entity: 'btg_request',
     entityId: req.user.id,
    metadata: {
      query: req.query,
      entityRef: 'BTG_LIST',
      resultCount: result.items.length
    }
  });

  return ok(res, result.items, 'BTG requests retrieved successfully', {
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    pages: Math.ceil(result.total / result.pageSize)
  });
}

/**
 * GET ACTIVE BTG FOR PATIENT (CHECK CURRENT ACCESS)
 */
export async function getActiveBTG(req, res) {
  if (!req.user.id) {
    throw new ApiError(400, 'Missing user id');
  }

  const { patientId } = req.query;
  if (!patientId) {
    throw new ApiError(400, 'Missing patientId');
  }

   logger.info(
    `User ${req.user.id} checking active BTG for patient ${patientId}`
  );

  const activeBTG = await btgService.getActiveBTG(patientId);

  return ok(res, activeBTG, 'Active BTG retrieved successfully');
}


/**
 * APPROVE BREAK-GLASS (ADMIN)
 */
export async function approveBTG(req, res) {
  const { id } = req.params;
  if (!id) {
      throw new ApiError(400, 'BTG ID is required');
  }
  logger.info(
    `Admin ${req.user.id} approving BTG request ${id}`
  );

  const before = await btgService.getBTGRequestById(id);

  const btg = await btgService.approveBTGRequest(
    id,
    req.user.id
  );

  await attachAudit(req, {
    action: AUDIT_ACTIONS.BREAK_GLASS_APPROVE,
    entity: 'btg_request_approval',
    entityId: btg.id,
    before,
    after: btg,
    metadata: {
      approvedBy: req.user.id
    }
  });

  return ok(res, {
    id: btg.id,
    status: btg.status,
    approvedBy: btg.approvedBy,
    approvedAt: btg.approvedAt,
    expiresAt: btg.expiresAt
  }, 'BTG approved successfully');
}

export async function rejectBTG(req, res) {
  const { id } = req.params;
  const { reason } = req.body;
  
    if (!id) {
      throw new ApiError(400, 'BTG ID is required');
    }
  const before = await btgService.getBTGRequestById(id);

  const btg = await btgService.rejectBTGRequest(
    id,
    req.user.id,
    reason
  );

  await attachAudit(req, {
    action: AUDIT_ACTIONS.BREAK_GLASS_REJECT,
    entity: 'btg_request_rejection',
    entityId: btg.id,
    before,
    after: btg,
    metadata: { reason }
  });

  return ok(res, btg, 'BTG request rejected');
}


export async function expireBTG(req, res) {
  const { id } = req.params;
  if (!id) {
      throw new ApiError(400, 'BTG ID is required');
  }

  const before = await btgService.getBTGRequestById(id);

  const btg = await btgService.expireBTGRequest(
    id,
    req.user.id
  );

  await attachAudit(req, {
    action: AUDIT_ACTIONS.BREAK_GLASS_EXPIRE,
    entity: 'btg_request_expiration',
    entityId: btg.id,
    before,
    after: btg
  });

  return ok(res, btg, 'BTG request expired');
}