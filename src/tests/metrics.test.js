import request from 'supertest';
import app from '../app.js';
import { setupDB, teardownDatabase, createTestUser } from './helpers.js';

let tokens = {};

beforeAll(async () => {
  await setupDB();
  const admin = await createTestUser({ 
    role: 'admin', 
    email: 'ops.manager@busade-emr-demo.com' 
  });
  tokens.admin = admin.accessToken;
});

afterAll(async () => {
  await teardownDatabase();
});

describe('System Monitoring: Metrics Endpoints', () => {
  
  it('should allow Admin to fetch system performance metrics (200 OK)', async () => {
    const res = await request(app)
      .get('/api/metrics')
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    
    // Logic: Verify typical Prometheus/Metrics keys exist
    // Useful for integration with Grafana later
    expect(res.body.data).toHaveProperty('uptime');
    expect(res.body.data).toHaveProperty('memoryUsage');
    expect(res.body.data).toHaveProperty('activeRequests');
  });

  it('should deny access to metrics without a valid token (401 Unauthorized)', async () => {
    const res = await request(app)
      .get('/api/metrics');

    expect(res.status).toBe(401);
    expect(res.body.status).toBe('fail');
  });

  it('should deny metrics access to low-privilege roles (403 Forbidden)', async () => {
    const nurse = await createTestUser({ 
      role: 'nurse', 
      email: 'nurse.metrics@busade-emr-demo.com' 
    });

    const res = await request(app)
      .get('/api/metrics')
      .set('Authorization', `Bearer ${nurse.accessToken}`);

    expect(res.status).toBe(403);
  });
});