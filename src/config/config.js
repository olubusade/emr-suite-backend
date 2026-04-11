import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { logger } from './logger.js'; // Assuming a logger exists for consistency

const env = process.env.ENV || process.env.NODE_ENV || 'development';

/**
 * ENVIRONMENT FILE MAPPING
 * Maps internal environment keys to physical .env filenames.
 * This preserves your specific naming convention for dev vs docker.
 */
const envMapping = {
  development: '.env.local.dev',
  dev: '.env.local.dev',
  docker: '.env.dev.docker',
  production: '.env.prod',
  prod: '.env.prod',
};

// Resolve the absolute path to the configuration file
const envFile = path.resolve(
  process.cwd(),
  envMapping[env] || `.env.${env}`
);

/**
 * BOOTSTRAP PHASE
 * Loads the mapped environment file. If it doesn't exist,
 * it falls back to a generic .env to prevent startup failure.
 */
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
  console.log(`[Config] Loaded environment: ${env} (${envFile})`);
} else {
  dotenv.config();
  console.warn(`[Config] Mapped file not found for '${env}', using default .env`);
}

/**
 * CONFIGURATION VALIDATOR
 * Enforces the "Fail-Fast" principle for critical infrastructure variables.
 */
function requireEnv(key, fallback) {
  const value = process.env[key] || fallback;
  if (!value) {
    throw new Error(`CRITICAL CONFIG ERROR: Missing required environment variable: ${key}`);
  }
  return value;
}

const dbConfig = {
  username: requireEnv('DB_USER', 'postgres'),
  password: requireEnv('DB_PASS', 'postgres'),
  database: requireEnv('DB_NAME', 'busade_emr_demo_db'),
  host: requireEnv('DB_HOST', 'localhost'),
  port: Number(requireEnv('DB_PORT', '5432')),
  dialect: 'postgres',
  // Only log SQL queries in local development to keep production logs clean
  logging: env === 'development' ? console.log : false,
};

/**
 * GLOBAL CONFIGURATION OBJECT
 * Exported as a singleton to be consumed by services and utilities.
 */
export const config = {
  port: Number(requireEnv('PORT', '5000')),
  env,
  corsOrigin: requireEnv('CORS_ORIGIN', '*'),
  jwt: {
    secret: requireEnv('JWT_SECRET'),
    refreshSecret: requireEnv('JWT_REFRESH_SECRET'),
    accessTtl: requireEnv('ACCESS_TTL', '15m'),
    refreshTtl: requireEnv('REFRESH_TTL', '7d'),
  },
  db: dbConfig,
};