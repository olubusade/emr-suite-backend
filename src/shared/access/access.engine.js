import { userHasPermission } from '../../modules/role/rbac.service.js';

import { BTGRequest } from '../../config/associations.js';
import { Op } from 'sequelize';
/**
 * EMR ACCESS ENGINE
 * Decides if a user can access clinical records
 */
export async function canAccessClinical({ userId, patientId }) {
  // 1. Direct permission check
  const hasDirectAccess = await userHasPermission(
    userId,
    'CLINICAL_NOTE_READ'
  );

  if (hasDirectAccess) {
    return {
      allowed: true,
      reason: 'DIRECT_PERMISSION',
      btgActive: false
    };
  }

  // 2. BTG fallback check
  const btg = await BTGRequest.findOne({
    where: {
      patientId,
      requestedBy: userId,
      status: 'APPROVED',
      expiresAt: { [Op.gt]: new Date() }
    },
    order: [['createdAt', 'DESC']]
  });

  if (btg) {
    return {
      allowed: true,
      reason: 'BREAK_GLASS_ACTIVE',
      btgActive: true,
      expiresAt: btg.expiresAt,
      grantedBy: btg.approvedBy,
      approvedAt: btg.approvedAt,
      btgId: btg.id
    };
  }

  // 3. Denied
  return {
    allowed: false,
    reason: 'NO_ACCESS'
  };
}