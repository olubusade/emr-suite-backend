// src/test/auth.edge.test.js
import request from 'supertest';
import app from '../app.js';
import { seedTestData, teardownTestDB, loginTestUser } from './testHelper.js';

let userLogin;

beforeAll(async () => {
  await seedTestData();
  userLogin = await loginTestUser('user@test.com', 'User123!');
});

afterAll(async () => {
  await teardownTestDB();
});

describe('Auth Edge Cases', () => {
  it('should not refresh with revoked token', async () => {
    // First refresh to revoke original token
    await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: userLogin.refreshToken });

    // Attempt using same token again
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: userLogin.refreshToken });

    expect(res.statusCode).toBe(401);
  });

  it('should logout user and revoke tokens', async () => {
    // Login again to get fresh tokens
    const loginRes = await loginTestUser('user@test.com', 'User123!');
    
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${loginRes.token}`)
      .send({ refreshToken: loginRes.refreshToken });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);

    // Attempt refresh after logout
    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: loginRes.refreshToken });

    expect(refreshRes.statusCode).toBe(401);
  });

  it('should prevent access to protected route after logout', async () => {
    // Logout user
    const loginRes = await loginTestUser('user@test.com', 'User123!');
    await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${loginRes.token}`)
      .send({ refreshToken: loginRes.refreshToken });

    // Attempt to access protected route
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${loginRes.token}`);

    expect(res.statusCode).toBe(401);
  });
});
