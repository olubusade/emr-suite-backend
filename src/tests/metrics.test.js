import request from 'supertest';
import app from '../app.js';
import { setupDatabase, teardownDatabase, createTestUser } from './testHelper.js';

let tokens = {};

beforeAll(async () => {
  await setupDatabase();
  const admin = await createTestUser({ role: 'admin' });
  tokens.admin = admin.accessToken;
});

afterAll(async () => {
  await teardownDatabase();
});

describe('Metrics Module', () => {
  it('should allow authorized user to fetch metrics', async () => {
    const res = await request(app)
      .get('/metrics')
      .set('Authorization', `Bearer ${tokens.admin}`);
    expect(res.status).toBe(200);
  });

  it('should deny unauthorized user', async () => {
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(401);
  });
});
