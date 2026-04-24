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
// Detect environment
const isProduction = (process.env.NODE_ENV || process.env.ENV) === 'production';

/**
 * CORE DATABASE CONFIGURATION
 * Shared across Development, Test, and Production to ensure parity.
 */
const dbConfig = {
  username: requireEnv('DB_USER'),
  password: requireEnv('DB_PASS'),
  database: requireEnv('DB_NAME'),
  host: requireEnv('DB_HOST'),
  port: Number(requireEnv('DB_PORT')),
  dialect: 'postgres',
  dialectOptions: isProduction
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    : {},
  logging: !isProduction && console.log, // Set to console.log in dev if debugging raw SQL queries
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