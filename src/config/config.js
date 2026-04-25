import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { logger } from './logger.js';

const env = process.env.ENV || process.env.NODE_ENV || 'development';

/**
 * ENVIRONMENT FILE MAPPING
 */
const envMapping = {
  development: '.env.local.dev',
  dev: '.env.local.dev',
  docker: '.env.dev.docker',
  production: '.env.prod',
  prod: '.env.prod',
};

// Resolve absolute path
const envFile = path.resolve(
  process.cwd(),
  envMapping[env] || `.env.${env}`
);

/**
 * BOOTSTRAP PHASE
 */
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });

  logger.info('[Config] Environment loaded', {
    env,
    file: envFile,
  });

} else {
  dotenv.config();

  logger.warn('[Config] Environment file not found, using default .env', {
    env,
    attemptedFile: envFile,
  });
}

/**
 * CONFIGURATION VALIDATOR
 *  * requireEnv ensures that we fail fast if any critical configuration is missing,
 * which is essential for a production-grade EMR system to avoid silent failures.
 * It allows fall backs for local development but enforces strict requirements in production environments.
 */
function requireEnv(key, fallback) {
  const value = process.env[key] || fallback;

  if (!value) {
    logger.error('Missing required environment variable', { key });

    throw new Error(
      `CRITICAL CONFIG ERROR: Missing required environment variable: ${key}`
    );
  }

  return value;
}

const dbConfig = {
  username: requireEnv('DB_USER'),
  password: requireEnv('DB_PASS'),
  database: requireEnv('DB_NAME'),
  host: requireEnv('DB_HOST'),
  port: Number(requireEnv('DB_PORT')),
  dialect: 'postgres',

  // Only log SQL queries in development
  logging:
    env === 'development'
      ? (msg) => logger.debug('[Sequelize]', { query: msg })
      : false,
};

/**
 * GLOBAL CONFIGURATION OBJECT
 */
//JWT_SECRET=$(openssl rand -base64 32)
export const config = {
  port: Number(requireEnv('PORT')),
  env,
  corsOrigin: requireEnv('CORS_ORIGIN'),

  jwt: {
    secret: requireEnv('JWT_SECRET'),
    refreshSecret: requireEnv('JWT_REFRESH_SECRET'),
    accessTtl: requireEnv('ACCESS_TTL'),
    refreshTtl: requireEnv('REFRESH_TTL'),
  },

  db: dbConfig,
};