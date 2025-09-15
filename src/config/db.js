import { sequelize } from './sequelize.js';
import { User } from '../models/index.js'; // models initialized with sequelize

export async function testDbConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connected!');
/* 
    const user = await User.findOne({ where: { active: true } });
    if (user) {
      console.log('Sample user row:', user.toJSON());
    } else {
      console.warn('No active user found.');
    } */
  } catch (err) {
    console.error('Oops! Database connection failed:', err);
    throw err;
  }
}
