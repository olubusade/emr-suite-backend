import request from 'supertest';
import app from '../app.js';
import { seedTestData, loginTestUser, teardownTestDB } from './testHelper.js';
import { User } from '../models/index.js';

let admin, user;
let adminToken, userToken, adminRefresh, userRefresh;

beforeAll(async () => {
  const seeded = await seedTestData();
  admin = seeded.admin;
  user = seeded.user;

  const adminLogin = await loginTestUser(admin.email, 'admin@123');
  adminToken = adminLogin.accessToken;
  adminRefresh = adminLogin.refreshToken;

  const userLogin = await loginTestUser(user.email, 'User123!');
  userToken = userLogin.accessToken;
  userRefresh = userLogin.refreshToken;
});

afterAll(async () => {
  await teardownTestDB();
});

// -------------------- Auth Module Tests -------------------- //
describe('Auth Endpoints', () => {
  test('Login success', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: admin.email, password: 'admin@123' });

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
      .send({ oldPassword: 'admin@123', newPassword: 'Newadmin@123' });

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

// -------------------- User Module Tests -------------------- //
describe('User Endpoints', () => {
  test('Get profile', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.email).toBe(user.email);
  });

  test('Update profile', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ fullName: 'Updated User' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.fullName).toBe('Updated User');
  });

  test('Admin: list users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('Admin: create user', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: 'new@test.com',
        fullName: 'New User',
        password: 'New123!',
        roleIds: [admin.roles[0].id]
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.email).toBe('new@test.com');
  });

  test('Admin: update user', async () => {
    const res = await request(app)
      .patch(`/api/users/${user.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ fullName: 'Patched User' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.fullName).toBe('Patched User');
  });

  test('Admin: delete user', async () => {
    const newUser = await User.create({
      email: 'delete@test.com',
      fullName: 'To Delete',
      passwordHash: 'hashedpw',
      active: true
    });

    await newUser.setRoles([admin.roles[0]]);

    const res = await request(app)
      .delete(`/api/users/${newUser.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.success).toBe(true);
  });
});
