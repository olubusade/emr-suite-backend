import request from 'supertest';
import app from '../app.js';
import { setupDB, teardownDatabase, createTestUser } from './testHelper.js';

let tokens = {};
let patientId;
// Use a more robust unique email generator for isolated test runs
let uniqueEmail = `test_patient_${Math.random().toString(36).substring(7)}@busade-emr-demo.com`;

beforeAll(async () => {
  await setupDB();
  
  // Logic: Ensure the user has clinical permissions
  const doctor = await createTestUser({ 
    role: 'doctor', 
    full_name: 'Dr. Busade Adedayo',
    email: 'doctor.test@busade-emr-demo.com'
  }); 
  tokens.doctor = doctor.accessToken;
});

afterAll(async () => {
  await teardownDatabase();
});

describe('Patient Module CRUD Operations', () => {
  
  it('should create a patient with full data payload (201 Created)', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${tokens.doctor}`)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        dob: '1990-01-01', 
        gender: 'male',
        email: uniqueEmail,
        password: 'securepassword123',
        middleName: 'M.',
        nationalId: 'NG-JD-1990-001',
        phone: '+2348012345678',
        maritalStatus: 'married',
        address: '10 Test Street, Demo City',
        bloodGroup: 'O+',
        emergencyContactName: 'Jane Doe',
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toHaveProperty('id');
    
    // Security Check: Standardize that sensitive fields never leak
    expect(res.body.data).not.toHaveProperty('password'); 
    expect(res.body.data).not.toHaveProperty('passwordHash'); 
    
    patientId = res.body.data.id;
  });

  it('should retrieve patient details via UUID (200 OK)', async () => {
    const res = await request(app)
      .get(`/api/patients/${patientId}`)
      .set('Authorization', `Bearer ${tokens.doctor}`);

    expect(res.status).toBe(200);
    expect(res.body.data.firstName).toBe('John');
    expect(res.body.data.nationalId).toBe('NG-JD-1990-001'); 
  });

  it('should update specific patient fields (200 OK)', async () => {
    const res = await request(app)
      .patch(`/api/patients/${patientId}`)
      .set('Authorization', `Bearer ${tokens.doctor}`)
      .send({ 
        maritalStatus: 'divorced'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.maritalStatus).toBe('divorced');
  });

  it('should soft-delete/archive a patient record (200/204)', async () => {
    const res = await request(app)
      .delete(`/api/patients/${patientId}`)
      .set('Authorization', `Bearer ${tokens.doctor}`);

    expect([200, 204]).toContain(res.status);
    
    // Final verification: Confirm 404 on subsequent get
    const check = await request(app)
      .get(`/api/patients/${patientId}`)
      .set('Authorization', `Bearer ${tokens.doctor}`);
    
    expect(check.status).toBe(404);
  });
});