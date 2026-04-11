import request from 'supertest';
import app from '../app.js';
import { setupDB, teardownDatabase, loginAs, createTestUser } from './helpers.js';

let userLogin;
let testUserEmail = 'edge.case@busade-emr-demo.com';
let testUserPassword = 'User123!';

beforeAll(async () => {
  await setupDB();
  // Create a base user for these tests
  await createTestUser({ 
    email: testUserEmail, 
    password: testUserPassword,
    role: 'doctor' 
  });
  userLogin = await loginAs(testUserEmail, testUserPassword);
});

afterAll(async () => {
  await teardownDatabase();
});

describe('Security: Token Revocation & Edge Cases', () => {
  
  it('should prevent Token Reuse (Refresh Token Rotation)', async () => {
    // 1. Perform first refresh to get new tokens and revoke the old one
    const firstRefresh = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: userLogin.refreshToken });

    expect(firstRefresh.status).toBe(200);
    const newRefreshToken = firstRefresh.body.data.refreshToken;

    // 2. Attempt to use the OLD (revoked) token again
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: userLogin.refreshToken });

    expect(res.status).toBe(401);
    expect(res.body.status).toBe('fail');
    expect(res.body.message).toMatch(/revoked|invalid/i);
  });

  it('should invalidate all tokens upon Logout', async () => {
    // Get fresh credentials
    const freshLogin = await loginAs(testUserEmail, testUserPassword);

    // Perform logout
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${freshLogin.accessToken}`)
      .send({ refreshToken: freshLogin.refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.data.success).toBe(true);

    // Verify the refresh token no longer works
    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: freshLogin.refreshToken });

    expect(refreshRes.status).toBe(401);
  });

  it('should deny access to protected resources with a logged-out Bearer token', async () => {
    const session = await loginAs(testUserEmail, testUserPassword);
    
    // Explicit Logout
    await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${session.accessToken}`)
      .send({ refreshToken: session.refreshToken });

    // Attempt to hit /me with the blacklisted/old token
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${session.accessToken}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/unauthorized/i);
  });
});