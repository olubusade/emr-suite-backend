import { Sequelize } from 'sequelize';
import { config } from './config.js';

/**
 * SEQUELIZE INSTANCE INITIALIZATION
 * Connects the application to PostgreSQL using the central config.
 * Includes a connection pool optimized for concurrent clinical sessions.
 */
export const sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: config.db.dialect,
    logging: config.db.logging,
    
    /**
     * GLOBAL MODEL DEFAULTS
     * Ensures consistent schema behavior across all EMR entities.
     */
    define: {
      timestamps: true, // Automatically manages createdAt and updatedAt
      underscored: true, // Maps camelCase models to snake_case DB columns (e.g., patient_id)
    },

    /**
     * CONNECTION POOLING
     * Manages reusable database connections to reduce handshake overhead.
     */
    pool: {
      max: 10,       // Maximum number of active connections in the pool
      min: 0,        // Minimum number of active connections
      acquire: 30000, // Max time (ms) to wait for a connection before throwing an error
      idle: 10000,    // Time (ms) a connection can be idle before being released
    },
  }
);