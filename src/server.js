import app from './app.js';
import { config } from './config/config.js';
import { sequelize } from './config/sequelize.js';
import { testDbConnection } from './config/db.js';

async function start() {
  try {
    await testDbConnection();

    // Uncomment in dev if needed
    // await sequelize.sync({ alter: true });
    // console.log('Models synced');

    app.listen(config.port, () => {
      console.log(`Busade's EMR Demo API running in ${config.env} mode at http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error('Server failed to start:', err);
    process.exit(1);
  }
}

start();
