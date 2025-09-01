import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Determine environment
const env = process.env.ENV || process.env.NODE_ENV || 'development';

// Determine the .env file path
const envFile = path.resolve(process.cwd(), `.env.${env}`);

// Load the correct .env file if it exists
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
  console.log(`✅ Loaded environment variables from ${envFile}`);
} else {
  dotenv.config(); // fallback to default .env
  console.warn(`⚠️  .env file for '${env}' not found, using default .env`);
}

export const config = {
  port: Number(process.env.PORT || 5000),
  env,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  jwt: {
    secret: process.env.JWT_SECRET || 'supersecret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refreshsupersecret',
    accessTtl: process.env.ACCESS_TTL || '15m',
    refreshTtl: process.env.REFRESH_TTL || '7d',
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'busade_emr_demo_db',
    dialect: 'postgres',
    logging: false, // set to console.log for debugging SQL queries
  },
};
