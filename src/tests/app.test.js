import request from 'supertest';
import app from '../app.js';
import { seedTestData, loginTestUser, teardownTestDB } from './testHelper.js';
import { User } from '../models/index.js';

let admin, user;
let adminToken, userToken;
let adminRefresh, userRefresh;

beforeAll(async () => {
  const seeded = await seedTestData();
  admin = seeded.admin;
  user = seeded.user;

  // Admin login
  const adminLogin = await loginTestUser(admin.email, 'admin@123');
  adminToken = adminLogin.accessToken;
  adminRefresh = adminLogin.refreshToken;

  // Normal user login
  const userLogin = await loginTestUser(user.email, 'User123!');
  userToken = userLogin.accessToken;
  userRefresh = userLogin.refreshToken;
});

afterAll(async () => {
  await teardownTestDB();
});

// ============================
// AUTH MODULE
// ============================
describe('AUTH MODULE', () => {
  test('Login success', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: admin.email,
        password: 'admin@123',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.email).toBe(admin.email);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  test('Refresh token success', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: adminRefresh });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  test('Change password success', async () => {
    const res = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        oldPassword: 'admin@123',
        newPassword: 'Newadmin@123',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.success).toBe(true);
  });

  test('Logout success', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ refreshToken: adminRefresh });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.success).toBe(true);
  });
});

// ============================
// USER MODULE
// ============================
describe('USER MODULE', () => {
  test('Get profile (self)', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.email).toBe(user.email);
  });

  test('Update profile (self)', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ fullName: 'Updated User' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.fullName).toBe('Updated User');
  });

  test('Admin can list users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('Admin creates user', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fname: 'New',
        lname: 'User',
        email: 'new@test.com',
        password: 'New123!',
        roleIds: admin.roles?.length ? [admin.roles[0].id] : [],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.email).toBe('new@test.com');
  });

  test('Admin updates user', async () => {
    const res = await request(app)
      .patch(`/api/users/${user.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ fname: 'Patched' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.fname).toBe('Patched');
  });

  test('Admin deletes user', async () => {
    const tempUser = await User.create({
      fname: 'Temp',
      lname: 'Delete',
      email: 'delete@test.com',
      passwordHash: 'hashedpw',
      active: true,
    });

    const res = await request(app)
      .delete(`/api/users/${tempUser.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect([200, 204]).toContain(res.statusCode);
  });
});