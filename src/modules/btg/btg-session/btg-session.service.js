import { Op } from 'sequelize';
import { BTGSession, BTGRequest, User, Role } from '../../../config/associations.js';
import ApiError from '../../../shared/utils/ApiError.js';
/**
 * Register or update active BTG viewer session
 */
export async function registerBTGViewer({ btgId, patientId, user }) {

  if (!patientId || !user.id || !btgId) {
    throw new ApiError(400, 'Missing BTG session context');
  }

  const btg = await BTGRequest.findByPk(btgId);

  if (!btg) {
    throw new ApiError(404, 'BTG request not found');
  }

  const isExpired = btg.expiresAt && new Date(btg.expiresAt) < new Date();

  if (btg.status !== 'APPROVED' || isExpired) {
    throw new ApiError(403, 'BTG access is not active');
  }
  
    const fetchedUser = await User.findOne({
      where: { id: user.id, active: true }
    });
    
    const role = user.roles.some(r => r === 'nurse') ? true : false;
    // strict control
    if (!role) {
        throw new ApiError(403, 'Only nurses can initiate BTG sessions');
    }
    
  const [session] = await BTGSession.findOrCreate({
    where: {
      btgRequestId:btgId,
      patientId,
      userId: user.id
    },
    defaults: {
      userName: fetchedUser.fName + ' ' + fetchedUser.lName || fetchedUser.fullName || 'Unknown',
      role: 'nurse',
      accessedAt: new Date(),
      lastSeenAt: new Date(),
      status: 'ACTIVE'
    }
  });

  await session.update({
    lastSeenAt: new Date()
  });

  return session;
}

/**
 * Get active viewers (heartbeat window: 2 mins)
 */
export async function getActiveBTGViewers(patientId) {
  const cutoff = new Date(Date.now() - 2 * 60 * 1000);

  const viewers = await BTGSession.findAll({
    where: {
      patientId,
      lastSeenAt: {
        [Op.gte]: cutoff
      }
    },
    order: [['lastSeenAt', 'DESC']]
  });

  return viewers.map(v => ({
    userId: v.userId,
    name: v.userName,
    role: v.role,
    accessedAt: v.accessedAt,
    lastSeenAt: v.lastSeenAt
  }));
}
/**
 * GET ACTIVE SESSION FOR PATIENT
 */
export async function getActiveSession(patientId) {

  const session = await BTGSession.findOne({
    where: {
        patientId,
        status: 'ACTIVE',
        lastSeenAt: {
            [Op.gt]: new Date(Date.now() - 60 * 1000) // last 1 minute
        }
    },
    order: [['createdAt', 'DESC']]
  });

  if (!session) return null;

  return formatSession(session);
}

/**
 * Remove viewer session (on logout/close)
 */
export async function removeBTGViewer({ btgRequestId, userId }) {
  return await BTGSession.destroy({
    where: { btgRequestId, userId }
  });
}


/**
 * FORMAT FOR FRONTEND
 */
function formatSession(session) {
  return {
    id: session.id,
    patientId: session.patientId,
    userId: session.userId,
    btgRequestId: session.btgRequestId,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
    status: session.status
  };
}
