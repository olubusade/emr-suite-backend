import request from 'supertest';
import app from '../app.js';
import { setupDB, loginAs } from './helpers.js';

let adminToken, adminRefresh;

beforeAll(async () => {
  await setupDB();
  const login = await loginAs('hospitaladmin@busade-emr-demo.com', 'password123');
  adminToken = login.accessToken;
  adminRefresh = login.refreshToken;
});

describe('Auth Module Integration', () => {
  
  test('POST /api/auth/login - Success with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'hospitaladmin@busade-emr-demo.com',
        password: 'password123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toHaveProperty('accessToken');
  });

  test('POST /api/auth/login - Failure with invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'hospitaladmin@busade-emr-demo.com',
        password: 'wrong_password'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe('fail');
  });

  test('POST /api/auth/refresh - Rotate tokens successfully', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: adminRefresh });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('accessToken');
  });

  test('POST /api/auth/change-password - Authorized update', async () => {
    const res = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ 
        oldPassword: 'password123', 
        newPassword: 'NewSecurePassword!123' 
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/success/i);
  });
});