// src/test/rbac.edge.test.js
import request from 'supertest';
import app from '../app.js';
import { seedTestData, teardownTestDB, loginTestUser } from './testHelper.js';

let adminToken, userToken;

beforeAll(async () => {
  await seedTestData();
  adminToken = (await loginTestUser('admin@test.com', 'Admin123!')).token;
  userToken = (await loginTestUser('user@test.com', 'User123!')).token;
});

afterAll(async () => {
  await teardownTestDB();
});

describe('RBAC Edge Cases', () => {
  it('should deny access if user has no permission', async () => {
    const res = await request(app)
      .patch('/api/users/1')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ full_name: 'Hacker User' });

    expect(res.statusCode).toBe(403);
  });

  it('should allow admin to update other user', async () => {
    const res = await request(app)
      .patch('/api/users/2')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ full_name: 'Updated by Admin' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('full_name', 'Updated by Admin');
  });

  it('should deny access without token', async () => {
    const res = await request(app)
      .get('/api/users');

    expect(res.statusCode).toBe(401);
  });

  it('should deny invalid token', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer invalidtoken`);

    expect(res.statusCode).toBe(401);
  });
});
