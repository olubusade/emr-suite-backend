import request from 'supertest';
import app from '../app.js';
import { setupDB, loginAs } from './testHelper.js';

let adminToken;

beforeAll(async () => {
  await setupDB();
  const adminLogin = await loginAs({ email: 'admin@busade-emr-demo.com', password: 'password123' });
  adminToken = adminLogin.accessToken;
});

afterAll(async () => {
  // Optional: teardown DB if needed
});

describe('Auth Module', () => {
  test('Login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@busade-emr-demo.com',
        password: 'password123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  test('Login with invalid credentials fails', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@busade-emr-demo.com',
        password: 'wrongpass'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('data', null);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  test('Refresh token works', async () => {
    // First, login to get tokens
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@busade-emr-demo.com',
        password: 'password123'
      });

    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: loginRes.body.data.refreshToken });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  test('Change password works', async () => {
    const res = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ oldPassword: 'password123', newPassword: 'newpass123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data.success).toBe(true);
  });
});
