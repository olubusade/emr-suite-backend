import request from 'supertest';
import app from '../app.js';
import { sequelize, User, Role } from '../models/index.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export async function setupDB() {
  // Use force: true only in test environment to ensure a clean slate
  await sequelize.sync({ force: true });

  const roles = {};
  const roleNames = ['super_admin', 'admin', 'doctor', 'nurse', 'receptionist'];
  
  for (const name of roleNames) {
    const [role] = await Role.findOrCreate({ 
      where: { name },
      defaults: { id: uuidv4() }
    });
    roles[name] = role;
  }

  const adminPassword = await bcrypt.hash('password123', 10);
  const adminUser = await User.create({
    id: uuidv4(),
    fName: 'Admin',
    lName: 'User',
    fullName: 'Admin User',
    email: 'admin@busade-emr-demo.com',
    passwordHash: adminPassword,
    active: true
  });

  // Assign role
  await adminUser.setRoles([roles.admin]);

  return { roles, adminUser };
}

export async function loginAs(email, password) {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  return {
    accessToken: res.body.data?.accessToken,
    refreshToken: res.body.data?.refreshToken,
    user: res.body.data?.user
  };
}