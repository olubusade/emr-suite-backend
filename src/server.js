import app from './app.js';
import { config } from './config/config.js';
import { logger } from './config/logger.js'; // Swapping console for Winston
import { testDbConnection } from './config/db.js';
import { sequelize } from './config/sequelize.js';

/**
 * APPLICATION BOOTSTRAP
 * This is the entry point for the EMR Suite. We ensure the infrastructure (DB) 
 * is ready before opening the port to incoming traffic.
 */
async function start() {
  try {
    logger.info(`System Boot: Initializing EMR Suite in ${config.env} mode...`);

    // 1. DATABASE CONNECTIVITY CHECK
    // We fail fast here if the DB is unreachable to prevent 'Zombies' in the cluster.
    await testDbConnection();
    logger.info('Infrastructure: Database connection verified.');

    /**
     * SCHEMA SYNCHRONIZATION
     * In a production EMR, we rely on Migrations (Sequelize-CLI).
     * Automatic syncing is disabled here to prevent accidental data loss.
     */
     /* await sequelize.sync({ alter: true }); */

    // 2. PORT BINDING
    const PORT = config.port || 5000;
    app.listen(PORT, () => {
      logger.info(`Service Online: Busade's EMR Demo API running at http://localhost:${PORT}`, {
        environment: config.env,
        port: PORT,
        processId: process.pid
      });
    });

  } catch (err) {
    // 3. CRITICAL FAILURE LOGGING
    // We log the error to the persistent file system before killing the process.
    logger.error('CRITICAL: Server bootstrap failed. Shutting down...', {
      error: err.message,
      stack: err.stack
    });
    
    // Brief delay to allow Winston to flush the error to the log file
    setTimeout(() => {
      process.exit(1);
    }, 500);
  }
}

/**
 * 4. PROCESS SAFETY NETS
 * Capturing errors that happen outside the Express context (e.g., failed Promises).
 */
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection:', { reason });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', { error: err.message, stack: err.stack });
  // In production, an uncaught exception should lead to a graceful restart
  process.exit(1);
});

start();