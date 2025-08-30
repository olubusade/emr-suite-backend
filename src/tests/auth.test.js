// src/test/auth.test.js
import request from 'supertest';
import app from '../app.js';
import { setupDB, loginAs } from './testHelper.js';

let adminToken;

beforeAll(async () => {
  await setupDB();
  adminToken = await loginAs();
});

describe('Auth Module', () => {
  test('Login with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'password123'
    });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  test('Login with invalid credentials fails', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'wrongpass'
    });
    expect(res.status).toBe(401);
  });

  test('Refresh token works', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'password123'
    });

    const res = await request(app).post('/api/auth/refresh').send({
      refreshToken: loginRes.body.refreshToken
    });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  test('Change password works', async () => {
    const res = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ oldPassword: 'password123', newPassword: 'newpass123' });
    expect(res.status).toBe(200);
  });
});
