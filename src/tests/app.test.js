import request from 'supertest';
import app from '../app.js';
import { seedTestData, loginTestUser, teardownTestDB } from './testHelper.js';
import { User, Role, Permission } from '../models/index.js';

let admin, user;
let adminToken, userToken, adminRefresh, userRefresh;

beforeAll(async () => {
  const seeded = await seedTestData();
  admin = seeded.admin;
  user = seeded.user;

  const adminLogin = await loginTestUser(admin.email, 'Admin123!');
  adminToken = adminLogin.token;
  adminRefresh = adminLogin.refreshToken;

  const userLogin = await loginTestUser(user.email, 'User123!');
  userToken = userLogin.token;
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
      .send({ email: admin.email, password: 'Admin123!' });
    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe(admin.email);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  test('Refresh token success', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: adminRefresh });
    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  test('Change password success', async () => {
    const res = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ oldPassword: 'Admin123!', newPassword: 'NewAdmin123!' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('Logout success', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ refreshToken: adminRefresh });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// -------------------- User Module Tests -------------------- //
describe('User Endpoints', () => {
  test('Get profile', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(user.email);
  });

  test('Update profile', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ full_name: 'Updated User' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated User');
  });

  test('Admin: list users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('Admin: create user', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'new@test.com', full_name: 'New User', password: 'New123!', role_id: admin.role_id });
    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe('new@test.com');
  });

  test('Admin: update user', async () => {
    const res = await request(app)
      .patch(`/api/users/${user.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ full_name: 'Patched User' });
    expect(res.statusCode).toBe(200);
    expect(res.body.full_name).toBe('Patched User');
  });

  test('Admin: delete user', async () => {
    const newUser = await User.create({
      email: 'delete@test.com',
      full_name: 'To Delete',
      password_hash: 'hashedpw',
      role_id: admin.role_id,
      active: true
    });
    const res = await request(app)
      .delete(`/api/users/${newUser.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(204);
  });
});
