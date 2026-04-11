require('dotenv').config({
  path: `.env.${process.env.ENV || process.env.NODE_ENV || 'development'}`
});

/**
 * ENVIRONMENT VARIABLE VALIDATOR
 * Ensures the application does not start with a "Partial Configuration,"
 * which is a common cause of silent failures in production.
 */
function requireEnv(key, fallback) {
  const value = process.env[key] || fallback;
  if (!value) {
    /**
     * SECURITY NOTE: We throw an explicit error here. 
     * In a Senior architecture, 'Failing Fast' is better than 
     * running with undefined connection strings.
     */
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * CORE DATABASE CONFIGURATION
 * Shared across Development, Test, and Production to ensure parity.
 */
const dbConfig = {
  username: requireEnv('DB_USER', 'postgres'),
  password: requireEnv('DB_PASS', 'postgres'),
  database: requireEnv('DB_NAME', 'busade_emr_demo_db'),
  host: requireEnv('DB_HOST', 'localhost'),
  port: Number(requireEnv('DB_PORT', '5432')),
  dialect: 'postgres',
  logging: false, // Set to console.log in dev if debugging raw SQL queries
  define: {
    timestamps: true, // Standardizes the inclusion of createdAt/updatedAt
    underscored: true, // Maps camelCase models to snake_case table columns (Postgres standard)
  }
};

module.exports = {
  development: dbConfig, // Local machine development
  test: dbConfig,        // CI/CD and unit testing
  production: dbConfig,  // Dockerized environments (Dev/Prod)
};