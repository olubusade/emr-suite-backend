// patients.test.js

import request from 'supertest';
import app from '../app.js';
import { setupDatabase, teardownDatabase, createTestUser } from './testHelper.js';
/**
 * Store tokens for different user roles
 */

let tokens = {};
let patientId;
let uniqueEmail = `test_patient_${Date.now()}@busade-emr-demo.com`; // Ensure unique email for each test run

beforeAll(async () => {
  await setupDatabase();
  // Ensure the test user has the permission to create/manage patients
  const doctor = await createTestUser({ role: 'doctor' }); 
  tokens.doctor = doctor.accessToken;
});

afterAll(async () => {
  await teardownDatabase();
});

describe('Patient Module CRUD', () => {
  
  // ------------------------------------------------------------------
  // CREATE PATIENT TEST (Full Payload)
  // ------------------------------------------------------------------
  it('should create a patient with full data payload', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${tokens.doctor}`)
      .send({
        // MANDATORY FIELDS
        firstName: 'John',
        lastName: 'Doe',
        dob: '1990-01-01', 
        gender: 'male',
        email: uniqueEmail, // Use the dynamically generated unique email
        password: 'securepassword123', // Must be included and meet min length
        
        // HIGH-VALUE OPTIONAL FIELDS (Ensuring schema/model handles them)
        middleName: 'M.',
        nationalId: 'NG-JD-1990-001',
        phone: '+2348012345678',
        maritalStatus: 'married',
        address: '10 Test Street, Demo City',
        bloodGroup: 'O+',
        emergencyContactName: 'Jane Doe',
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.firstName).toBe('John');
    expect(res.body.data.email).toBe(uniqueEmail);
    //Check that sensitive data (password) is NOT returned
    expect(res.body.data).not.toHaveProperty('password'); 
    
    patientId = res.body.data.id;
  });

  // ------------------------------------------------------------------
  // GET, UPDATE, DELETE TESTS
  // ------------------------------------------------------------------
  it('should get a patient', async () => {
    const res = await request(app)
      .get(`/api/patients/${patientId}`)
      .set('Authorization', `Bearer ${tokens.doctor}`);

    expect(res.status).toBe(200);
    expect(res.body.data.firstName).toBe('John');
    expect(res.body.data.lastName).toBe('Doe');
    // Check that one of the high-value fields was saved
    expect(res.body.data.nationalId).toBe('NG-JD-1990-001'); 
  });

  it('should update a patient', async () => {
    const res = await request(app)
      .patch(`/api/patients/${patientId}`)
      .set('Authorization', `Bearer ${tokens.doctor}`)
      .send({ 
        // Update a field
        maritalStatus: 'divorced',
        // Update password (must be hashed in service)
        password: 'newsecurepassword456'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.maritalStatus).toBe('divorced');
    //Ensure password is still NOT returned
    expect(res.body.data).not.toHaveProperty('password'); 
  });

  it('should delete a patient', async () => {
    const res = await request(app)
      .delete(`/api/patients/${patientId}`)
      .set('Authorization', `Bearer ${tokens.doctor}`);

    // Expect 200/204, or 404 on subsequent get
    expect([200, 204]).toContain(res.status); 
  });
});