import { sequelize } from './sequelize.js';
import { User } from '../models/index.js'; // models initialized with sequelize
import { logger } from './logger.js';

/**
 * DATABASE CONNECTIVITY TEST
 * Performs a low-level handshake with Postgres to ensure credentials 
 * and network paths are correct before the API starts accepting traffic.
 */
export async function testDbConnection() {
  try {
    // Authenticate performs a 'SELECT 1+1' or similar low-overhead query
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

/* // This section is preserved for manual data-layer verification
    const user = await User.findOne({ where: { active: true } });
    if (user) {
      console.log('Sample user row:', user.toJSON());
    } else {
      console.warn('No active user found.');
    } 
*/
  } catch (err) {
    // We use a specific console.error format to stand out in the logs
    console.error('Oops! Database connection failed:', err.message);
    
    // We re-throw the error to trigger the 'set -e' in entrypoint.sh 
    // and stop the container from starting in a broken state.
    throw err;
  }
}