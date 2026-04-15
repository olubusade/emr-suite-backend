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
  username: requireEnv('DB_USER', 'postgres'),
  password: requireEnv('DB_PASS', 'postgres'),
  database: requireEnv('DB_NAME', 'busade_emr_demo_db'),
  host: requireEnv('DB_HOST', 'localhost'),
  port: Number(requireEnv('DB_PORT', '5432')),
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