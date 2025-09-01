// src/test/testHelper.js
import request from 'supertest';
import app from '../app.js';
import { sequelize, User, Role } from '../models/index.js';
import bcrypt from 'bcrypt';

/**
 * Set up database for tests
 */
export async function setupDB() {
  // Reset database
  await sequelize.sync({ force: true });

  // Seed roles
  const roles = {};
  const roleNames = ['super_admin', 'admin', 'doctor', 'nurse', 'reception', 'biller', 'lab_technician', 'pharmacist'];
  for (const roleName of roleNames) {
    roles[roleName] = await Role.create({ name: roleName });
  }

  // Create admin user
  const adminPassword = await bcrypt.hash('password123', 10);
  const adminUser = await User.create({
    fname: 'Admin',
    lname: 'User',
    full_name: 'Admin User',
    email: 'admin@busade-emr-demo.com',
    password_hash: adminPassword,
    role_id: roles.admin.id,
    active: true
  });

  return { roles, adminUser };
}

/**
 * Tear down database after tests
 */
export async function teardownDatabase() {
  await sequelize.drop();
}

/**
 * Login helper to get tokens
 */
export async function loginAs(email = 'admin@busade-emr-demo.com', password = 'password123') {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  if (!res.body.accessToken) {
    throw new Error(`Login failed for ${email}. Check your test DB setup.`);
  }

  return {
    accessToken: res.body.accessToken,
    refreshToken: res.body.refreshToken,
    user: res.body.user
  };
}

/**
 * Create test user dynamically
 */
export async function createTestUser({
  email = 'user@busade-emr-demo.com',
  full_name = 'Test User',
  role = 'doctor',
  password = 'password123'
} = {}) {
  const [fname, lname] = full_name.split(' ');
  const hashed = await bcrypt.hash(password, 10);
  const roleRecord = await Role.findOne({ where: { name: role } });

  if (!roleRecord) throw new Error(`Role "${role}" not found in DB`);

  const user = await User.create({
    email,
    full_name,
    fname: fname || 'Test',
    lname: lname || 'User',
    password_hash: hashed,
    role_id: roleRecord.id,
    active: true
  });

  // Login to get token
  const tokens = await loginAs(email, password);
  return { ...tokens, user };
}
