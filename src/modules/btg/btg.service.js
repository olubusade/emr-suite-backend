import { BTGRequest, Patient, User } from '../../config/associations.js';
import ApiError from '../../shared/utils/ApiError.js';
import { Op } from 'sequelize';
import { reportError, logSecurityAlert } from '../../shared/utils/monitoring.js';

export async function listBTGRequests({
  page = 1,
  pageSize = 20,
  status,
  patientId,
  requestedBy,
  startDate,
  endDate,
  sortBy,
  order
}) {
  const pageInt = Number(page) || 1;
  const limitInt = Number(pageSize) || 20;
  const offset = (pageInt - 1) * limitInt;

  const where = {};

  if (status) where.status = status;
  if (patientId) where.patientId = patientId;
  if (requestedBy) where.requestedBy = requestedBy;

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt[Op.gte] = new Date(startDate);
    if (endDate) where.createdAt[Op.lte] = new Date(endDate);
  }

  const allowedSortFields = ['createdAt', 'updatedAt'];
  const allowedOrders = ['ASC', 'DESC'];

  const sortField = allowedSortFields.includes(sortBy)
    ? sortBy
    : 'createdAt';

  const sortOrder = allowedOrders.includes((order || '').toUpperCase())
    ? order.toUpperCase()
    : 'DESC';

  try {
    const { count, rows } = await BTGRequest.findAndCountAll({
      where,
      limit: limitInt,
      offset,
      order: [[sortField, sortOrder]],
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'fName','lName','fullName', 'email','designation']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'fName','lName','fullName']
        },
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'firstName', 'lastName', 'fullName']
        }
      ]
    });

    return {
      items: rows.map(formatBTG),
      total: count,
      page: pageInt,
      pageSize: limitInt
    };
  } catch (err) {
    reportError(err, {
      service: 'BTGService',
      operation: 'listBTGRequests'
    });
    throw err;
  }
}

export async function createBTGRequest({
  patientId,
  userId,
  reason,
  durationMinutes = 10
}) {
  if (!patientId || !userId) {
    throw new ApiError(400, 'Missing BTG context');
  }

  if (!reason) {
    throw new ApiError(400, 'Reason is required');
  }

  const request = await Patient.findByPk(patientId);

  if (!request) throw new ApiError(404, 'Patient ID not found');

  const allowedDurations = [5, 10, 15, 30, 60];

  if (!allowedDurations.includes(durationMinutes)) {
    throw new ApiError(400, 'Invalid BTG duration');
  }

  const now = new Date();

  const expiresAt = new Date(
    now.getTime() + durationMinutes * 60 * 1000
  );

  return await BTGRequest.create({
    patientId,
    requestedBy: userId,
    reason,
    durationMinutes,
    expiresAt,
    status: 'PENDING'
  });
}


export async function approveBTGRequest(id, adminId, decisionReason) {
  const request = await BTGRequest.findByPk(id);

  if (!request) throw new ApiError(404, 'BTG request not found');

  if (request.status !== 'PENDING') {
    throw new ApiError(409, 'Already processed');
  }

  const expiresAt = new Date(
    Date.now() + (request.durationMinutes || 15) * 60 * 1000
  );

  await request.update({
    status: 'APPROVED',
    approvedBy: adminId,
    decisionReason,
    approvedAt: new Date(),
    expiresAt
  });

  return request;
}


export async function getBTGRequestById(id) {
  try {
    const btg = await BTGRequest.findByPk(id);

    if (!btg) {
      throw new ApiError(404, 'BTG request not found');
    }

    return btg;
  } catch (err) {
    reportError(err, {
      service: 'BTGService',
      operation: 'getBTGRequestById',
      btgId: id
    });
    throw err;
  }
}

export async function getActiveBTG(patientId) {
  const now = new Date();

  const btg = await BTGRequest.findOne({
    where: {
      patientId,
      status: {
        [Op.in]: ['APPROVED', 'PENDING']
      }
    },
    order: [['createdAt', 'DESC']]
  });

  if (!btg) {
    return { data: null };
  }

  const expiresAt = btg.expiresAt ? new Date(btg.expiresAt) : null;
  const isExpired = expiresAt ? expiresAt < now : false;

  return {
      id: btg.id,
      patientId: btg.patientId,
      status: btg.status,
      reason: btg.reason,
      createdAt: btg.createdAt,
      requestedBy: btg.requestedBy,
      expiresAt,
      isExpired
  };
}

export async function rejectBTGRequest(id, adminId, decisionReason) {
  const request = await BTGRequest.findByPk(id);

  if (!request) throw new ApiError(404, 'BTG request not found');

  if (request.status !== 'PENDING') {
    throw new ApiError(409, 'Only pending requests can be rejected');
  }

  await request.update({
    status: 'REJECTED',
    approvedBy: adminId,
    rejectedAt: new Date(),
    decisionReason
  });

  return request;
}

export async function revokeBTGRequest(id, adminId, decisionReason) {
  const request = await BTGRequest.findByPk(id);

  if (!request) throw new ApiError(404, 'BTG request not found');

  if (request.status !== 'APPROVED') {
    throw new ApiError(409, 'Only approved requests can be revoked');
  }

  await request.update({
    status: 'REVOKED',
    approvedBy: adminId,
    revokedAt: new Date(),
    decisionReason
  });

  return request;
}

export async function expireBTGRequest(id, adminId, decisionReason) {
  const request = await BTGRequest.findByPk(id);

  if (!request) throw new ApiError(404, 'BTG request not found');

  if (request.status !== 'APPROVED') {
    throw new ApiError(409, 'Only approved requests can be expired');
  }

  await request.update({
    status: 'EXPIRED',
    approvedBy: adminId,
    expiresAt: new Date(),
    decisionReason
  });

  return request;
}

function formatBTG(btg) {

  const now = new Date();
  const expiresAt = btg?.expiresAt ? new Date(btg.expiresAt) : null;

  const isExpired = expiresAt ? expiresAt.getTime() < now.getTime() : false;

  return {
    id: btg?.id,

    // normalized status (IMPORTANT)
    status: isExpired ? 'EXPIRED' : btg?.status,

    // optional but useful for UI consistency
    isExpired,

    reason: btg?.reason,
    decisionReason:btg?.decisionReason,
    expiresAt: btg?.expiresAt,
    durationMinutes: btg?.durationMinutes,
    createdAt: btg?.createdAt,

    requester: btg?.requester
      ? {
          id: btg.requester.id,
          fullName:
            btg.requester.fullName ||
            `${btg.requester.fName} ${btg.requester.lName}`,
          email: btg.requester.email,
          designation: btg.requester.designation
        }
      : null,

    approver: btg?.approver
      ? {
          id: btg.approver.id,
          fullName:
            btg.approver.fullName ||
            `${btg.approver.fName} ${btg.approver.lName}`
        }
      : {
          id: null,
          fullName: 'Super Admin'
        },

    patient: btg?.patient
      ? {
          id: btg.patient.id,
          fullName:
            btg.patient.fullName ||
            `${btg.patient.firstName} ${btg.patient.lastName}`
        }
      : null
  };
}