import request from 'supertest';
import app from '../app.js';
import { seedTestData, teardownTestDB, loginTestUser } from './testHelper.js';
/**
 * @description Tests for Role-Based Access Control (RBAC) edge cases
 * focusing on permission boundaries and unauthorized access attempts.
 */

let adminToken, userToken;

beforeAll(async () => {
  await seedTestData();
  adminToken = (await loginTestUser('admin@test.com', 'admin@123')).accessToken;
  userToken = (await loginTestUser('user@test.com', 'User123!')).accessToken;
});

afterAll(async () => {
  await teardownTestDB();
});

describe('RBAC Edge Cases', () => {
  it('should deny access if user lacks permission', async () => {
    const res = await request(app)
      .patch('/api/users/1')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ fname: 'Hacker', lname: 'User' });

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('message');
  });

  it('should allow admin to update other user', async () => {
    const res = await request(app)
      .patch('/api/users/2')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ fname: 'Updated', lname: 'ByAdmin' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('fname', 'Updated');
    expect(res.body.data).toHaveProperty('lname', 'ByAdmin');
  });

  it('should deny access without token', async () => {
    const res = await request(app)
      .get('/api/users');

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  it('should deny invalid token', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer invalidtoken');

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
  });
});
