// src/server.js
import { config } from './config/config.js';
import app from './app.js';
import { sequelize } from './db.js';

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected');

    // For demos only (Hey Recruiter!, you can comment in if you want to auto-sync)
    // await sequelize.sync({ alter: true });
    // console.log('Models synced');

    app.listen(config.port, () => {
      console.log(`🚀 API running at http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error('❌ DB connection failed:', err);
    process.exit(1);
  }
}
start();
