require('dotenv').config({
    path: `.env.${process.env.ENV || process.env.NODE_ENV || 'development'}`
  });
  
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
    logging: false,
  };
  
  module.exports = {
    development: dbConfig,
    test: dbConfig,
    production: dbConfig,
  };
  