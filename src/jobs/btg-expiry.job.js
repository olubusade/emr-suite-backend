import cron from 'node-cron';
import { Op } from 'sequelize';

import { BTGRequest, BTGSession } from '../config/associations.js';
import { reportError } from '../shared/utils/monitoring.js';
import { logger } from '../config/logger.js';
/**
 * Runs every 5 minutes
 */
export function startBTGExpiryJob() {

  cron.schedule('*/5 * * * *', async () => {
    logger.info('Running BTG expiry job...')

    const now = new Date();

    try {

      // =========================
      // 1. EXPIRE BTG REQUESTS
      // =========================
      const expiredRequests = await BTGRequest.update(
        { status: 'EXPIRED' },
        {
          where: {
            status: 'APPROVED',
            expiresAt: {
              [Op.ne]: null,
              [Op.lt]: now
            }
          }
        }
      );
      logger.info(`BTG Requests expired: ${expiredRequests[0] || 0}`);

      // =========================
      // 2. EXPIRE BTG SESSIONS
      // =========================
      const expiredSessions = await BTGSession.update(
        { status: 'EXPIRED' },
        {
          where: {
            status: 'ACTIVE',
            expiresAt: {
                [Op.lt]:now
            }
          }
        }
      );
      logger.info(`BTG Sessions expired: ${expiredSessions[0] || 0}`);

    } catch (error) {
      reportError(error, { service: 'BTG Session', operation: 'BTGCronJob'});
      throw error;
    }
  });
  logger.info('BTG Expiry Cron Job started (every 5 minutes)');
}