import request from 'supertest';
import app from '../app.js';
import { setupDB, teardownDatabase, createTestUser } from './testHelper.js';

let tokens = {};

beforeAll(async () => {
  // Logic: Fresh state for audit verification
  await setupDB();
  
  const superAdmin = await createTestUser({ 
    role: 'super_admin', 
    email: 'compliance.officer@busade-emr-demo.com' 
  });
  tokens.superAdmin = superAdmin.accessToken;
});

afterAll(async () => {
  await teardownDatabase();
});

describe('Security & Compliance: Audit Logging', () => {
  
  it('should allow Super Admin to retrieve the system audit trail (200 OK)', async () => {
    const res = await request(app)
      .get('/api/audits')
      .set('Authorization', `Bearer ${tokens.superAdmin}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);

    // If your seeder created logs, verify the schema integrity
    if (res.body.data.length > 0) {
      const log = res.body.data[0];
      expect(log).toHaveProperty('id');
      expect(log).toHaveProperty('action');   // e.g., 'CREATE', 'UPDATE'
      expect(log).toHaveProperty('entity');   // e.g., 'Patient', 'Vital'
      expect(log).toHaveProperty('performedBy'); // UUID of the user
    }
  });

  it('should enforce strict RBAC: Deny non-super-admin access (403 Forbidden)', async () => {
    // Logic: A doctor is highly privileged, but should NOT see system-wide audits
    const doctor = await createTestUser({ 
        role: 'doctor', 
        email: 'dr.privacy@busade-emr-demo.com' 
    });

    const res = await request(app)
      .get('/api/audits')
      .set('Authorization', `Bearer ${doctor.accessToken}`);

    expect(res.status).toBe(403);
    expect(res.body.status).toBe('fail');
    expect(res.body.message).toMatch(/permission|forbidden/i);
  });
});