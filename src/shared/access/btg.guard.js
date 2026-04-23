
import { BTGRequest } from '../../config/associations.js';

/**
 * 
 * check if the user has valid BTG access for the patient
 * returns true if there is an approved BTG request that has not expired
 */
export async function hasValidBTG({ patientId, userId }) {
  const btg = await BTGRequest.findOne({
    where: {
      patientId,
      requestedBy: userId,
      status: 'APPROVED'
    }
  });

  if (!btg) return false;

  const now = new Date();

  return btg.expiresAt && btg.expiresAt > now;
}