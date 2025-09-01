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
      .get('/api/audits')
      .set('Authorization', `Bearer ${tokens.superAdmin}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    if (res.body.data.length > 0) {
      const log = res.body.data[0];
      expect(log).toHaveProperty('id');
      expect(log).toHaveProperty('action');
      expect(log).toHaveProperty('entity');
      expect(log).toHaveProperty('entityId');
      expect(log).toHaveProperty('performedBy');
      expect(log).toHaveProperty('createdAt');
    }
  });

  it('should deny non-super admin access', async () => {
    const doctor = await createTestUser({ role: 'doctor' });
    const res = await request(app)
      .get('/api/audits')
      .set('Authorization', `Bearer ${doctor.accessToken}`);

    expect(res.status).toBe(403);
    expect(res.body.data).toEqual({ success: false });
    expect(res.body.message).toMatch(/forbidden/i);
  });
});
