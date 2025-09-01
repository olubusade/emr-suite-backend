import { Sequelize } from 'sequelize';
import { config } from './config/config.js';

export const sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: config.db.dialect,
    logging: config.db.logging,
  }
);

// Optional: test connection
export async function testDbConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected!');
  } catch (err) {
    console.error('❌ Database connection failed:', err);
  }
}
