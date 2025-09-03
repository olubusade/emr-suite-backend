import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Determine environment
const env = process.env.ENV || process.env.NODE_ENV || 'development';

// Resolve .env file path (i.e. .env.dev, .env.prod)
const envFile = path.resolve(process.cwd(), `.env.${env}`);

// Load the correct .env file if it exists
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
  console.log(`Loaded environment variables from ${envFile}`);
} else {
  dotenv.config(); // fallback to default .env
  console.warn(`.env file for '${env}' not found, using default .env`);
}

// Helper function for env validation
function requireEnv(key, fallback){
  const value = process.env[key] || fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

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
  db: {
    host: requireEnv('DB_HOST', 'localhost'),
    port: Number(requireEnv('DB_PORT', '5432')),
    username: requireEnv('DB_USER', 'postgres'),
    password: requireEnv('DB_PASS', 'postgres'),
    database: requireEnv('DB_NAME', 'busade_emr_demo_db'),
    dialect: 'postgres',
    logging: false,
  },
};
