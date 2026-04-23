import * as sessionService from './btg-session.service.js';
import { ok } from '../../../shared/utils/response.js';
import { attachAudit } from '../../../shared/middlewares/audit.middleware.js';
import { AUDIT_ACTIONS } from '../../../constants/index.js';

/**
 * Register active viewer (heartbeat)
 */
export async function registerViewer(req, res) {
  const { btgId, patientId } = req.body;
  
  const session = await sessionService.registerBTGViewer({
    btgId,
    patientId,
    user: req.user
  });

  await attachAudit(req, {
    action: AUDIT_ACTIONS.BREAK_GLASS_VIEW,
    entity: 'btg_session',
    entityId: session.id,
    metadata: { btgId, patientId }
  });

  return ok(res, session, 'BTG viewer registered');
}

/**
 * Get active viewers for patient
 */
export async function getViewers(req, res) {
  const { patientId } = req.params;

  const data = await sessionService.getActiveBTGViewers(patientId);

  return ok(res, data, 'Active BTG viewers retrieved');
}

/**
 * GET ACTIVE SESSION (DOCTOR VIEW)
 */
export async function getActiveBTGSession(req, res) {
  const { patientId } = req.params;

  const session = await sessionService.getActiveSession(patientId);

  return ok(res, session, 'BTG session retrieved');
}