import request from 'supertest';
import app from '../app.js';
import { setupDatabase, teardownDatabase, createTestUser } from './testHelper.js';

let tokens = {};

beforeAll(async () => {
  await setupDatabase();
  const superAdmin = await createTestUser({ role: 'super_admin' });
  tokens.superAdmin = superAdmin.accessToken;
});

afterAll(async () => {
  await teardownDatabase();
});

describe('Audit Module', () => {
  it('should allow super admin to fetch audit logs', async () => {
    const res = await request(app)
      .get('/audits')
      .set('Authorization', `Bearer ${tokens.superAdmin}`);
    expect(res.status).toBe(200);
  });

  it('should deny non-super admin access', async () => {
    const doctor = await createTestUser({ role: 'doctor' });
    const res = await request(app)
      .get('/audits')
      .set('Authorization', `Bearer ${doctor.accessToken}`);
    expect(res.status).toBe(403);
  });
});
