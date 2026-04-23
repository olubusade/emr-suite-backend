import cron from 'node-cron';
import { Op } from 'sequelize';

import { BTGRequest, BTGSession } from '../config/associations.js';
import { reportError } from '../shared/utils/monitoring.js';
import { logger } from '../config/logger.js';
/**
 * Runs every 5 minutes
 */
export function startBTGExpiryJob() {
  cron.schedule('*/1 * * * *', async () => {
    const now = new Date();

    try {
      // expire BTG requests
      const [reqCount] = await BTGRequest.update(
        { status: 'EXPIRED' },
        {
          where: {
            status: 'APPROVED',
            expiresAt: { [Op.lt]: now }
          }
        }
      );

      // expire sessions (inactivity-based)
      const [sessionCount] = await BTGSession.update(
        { status: 'EXPIRED' },
        {
          where: {
            status: 'ACTIVE',
            lastSeenAt: {
              [Op.lt]: new Date(Date.now() - 10 * 60 * 1000)
            }
          }
        }
      );

      logger.info(`BTG expired: requests=${reqCount}, sessions=${sessionCount}`);

    } catch (error) {
      reportError(error, {
        service: 'BTG',
        operation: 'expiry-cron'
      });
    }
  });

  logger.info('BTG Expiry Cron Job started (every 5 minutes)');
}