import request from 'supertest';
import app from '../app.js';
import { setupDB, teardownDatabase, createTestUser } from './testHelper.js';

let tokens = {};
let appointmentId;
let testPatientId;

beforeAll(async () => {
  const setup = await setupDB();
  
  // Logic: We need a real patient UUID to satisfy foreign key constraints
  const doctor = await createTestUser({ 
    role: 'doctor',
    email: 'appointment.doc@busade-emr-demo.com' 
  });
  tokens.doctor = doctor.accessToken;

  // Create a dummy patient for the appointment tests
  const patientRes = await request(app)
    .post('/api/patients')
    .set('Authorization', `Bearer ${tokens.doctor}`)
    .send({
      firstName: 'Test',
      lastName: 'Subject',
      email: 'subject@demo.com',
      dob: '1995-05-05',
      gender: 'other',
      password: 'Password123!'
    });
  
  testPatientId = patientRes.body.data.id;
});

afterAll(async () => {
  await teardownDatabase();
});

describe('Appointment Module Integration', () => {
  
  it('should schedule a new clinical encounter (201 Created)', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${tokens.doctor}`)
      .send({ 
        patientId: testPatientId, 
        appointmentDate: '2026-08-25T10:00:00.000Z',
        reason: 'General Checkup',
        status: 'scheduled'
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    appointmentId = res.body.data.id;
  });

  it('should retrieve encounter details by UUID', async () => {
    const res = await request(app)
      .get(`/api/appointments/${appointmentId}`)
      .set('Authorization', `Bearer ${tokens.doctor}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(appointmentId);
    expect(res.body.data.patientId).toBe(testPatientId);
  });

  it('should reschedule (patch) an existing appointment', async () => {
    const newDate = '2026-08-25T14:00:00.000Z';
    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}`)
      .set('Authorization', `Bearer ${tokens.doctor}`)
      .send({ appointmentDate: newDate });

    expect(res.status).toBe(200);
    // Logic: Standardize comparison to ISO string
    expect(new Date(res.body.data.appointmentDate).toISOString()).toBe(newDate);
  });

  it('should cancel (soft-delete) an appointment', async () => {
    const res = await request(app)
      .delete(`/api/appointments/${appointmentId}`)
      .set('Authorization', `Bearer ${tokens.doctor}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    
    // Final Check: Verify it is no longer in the active list
    const check = await request(app)
      .get(`/api/appointments/${appointmentId}`)
      .set('Authorization', `Bearer ${tokens.doctor}`);
    
    expect(check.status).toBe(404);
  });
});