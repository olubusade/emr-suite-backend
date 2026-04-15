import { sequelize } from './sequelize.js';
import { User } from '../config/associations.js';
import { logger } from './logger.js';

/**
 * DATABASE CONNECTIVITY TEST
 * Performs a low-level handshake with Postgres to ensure credentials 
 * and network paths are correct before the API starts accepting traffic.
 */
export async function testDbConnection() {
  try {
    // Authenticate performs a lightweight query (e.g., SELECT 1+1)
    await sequelize.authenticate();

    logger.info('Database connection established successfully.');

    /* 
    // Optional manual verification (keep commented for debugging)
    const user = await User.findOne({ where: { active: true } });
    if (user) {
      logger.info('Sample user row retrieved', { user: user.toJSON() });
    } else {
      logger.warn('No active user found.');
    }
    */

  } catch (err) {
    logger.error('Database connection failed', {
      message: err.message,
      stack: err.stack,
    });

    // Re-throw to stop app startup (important for Docker / CI)
    throw err;
  }
}