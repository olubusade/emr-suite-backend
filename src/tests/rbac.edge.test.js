import request from 'supertest';
import app from '../app.js';
import { setupDB, teardownDatabase, createTestUser, loginAs } from './helpers.js';

let adminToken, doctorToken, targetUserId;

beforeAll(async () => {
  const setup = await setupDB();
  
  // 1. Create an Admin
  const admin = await createTestUser({ 
    role: 'admin', 
    email: 'admin.sec@busade-emr-demo.com' 
  });
  const adminLogin = await loginAs(admin.email, 'password123');
  adminToken = adminLogin.accessToken;

  // 2. Create a Doctor (Limited permissions compared to Admin)
  const doctor = await createTestUser({ 
    role: 'doctor', 
    email: 'dr.user@busade-emr-demo.com' 
  });
  const doctorLogin = await loginAs(doctor.email, 'password123');
  doctorToken = doctorLogin.accessToken;
  
  targetUserId = doctor.id; // We'll try to have the Doctor edit themselves/others
});

afterAll(async () => {
  await teardownDatabase();
});

describe('RBAC & Middleware Edge Cases', () => {

  it('should block a Doctor from updating another user (403 Forbidden)', async () => {
    // Attempting to update a different user (e.g., the admin)
    const res = await request(app)
      .patch(`/api/users/${uuidv4()}`) 
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ fName: 'Malicious', lName: 'Update' });

    expect(res.status).toBe(403);
    expect(res.body.status).toBe('fail');
    expect(res.body.message).toMatch(/permission|forbidden/i);
  });

  it('should allow Admin to perform administrative updates (200 OK)', async () => {
    const res = await request(app)
      .patch(`/api/users/${targetUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ fName: 'Verified', lName: 'ByAdmin' });

    expect(res.status).toBe(200);
    expect(res.body.data.fName).toBe('Verified');
    expect(res.body.data.lName).toBe('ByAdmin');
  });

  it('should block requests with missing Authorization headers (401 Unauthorized)', async () => {
    const res = await request(app).get('/api/users');

    expect(res.status).toBe(401);
    expect(res.body.status).toBe('fail');
  });

  it('should reject malformed or invalid JWT signatures (401 Unauthorized)', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.payload');

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/token|unauthorized/i);
  });
});