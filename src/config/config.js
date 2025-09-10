import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const env = process.env.ENV || process.env.NODE_ENV || 'development';
const envFile = path.resolve(process.cwd(), `.env.${env}`);

if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
  console.log(`Loaded environment variables from ${envFile}`);
} else {
  dotenv.config();
  console.warn(`.env file for '${env}' not found, using default .env`);
}

function requireEnv(key, fallback) {
  const value = process.env[key] || fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
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
  logging: env === 'development' ? console.log : false,
};

//Export for the app (ESM only)
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
