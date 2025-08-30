import request from 'supertest';
import app from '../app.js';
import { setupDatabase, teardownDatabase, createTestUser } from './testHelper.js';

let tokens = {};
let appointmentId;

beforeAll(async () => {
  await setupDatabase();
  const doctor = await createTestUser({ role: 'doctor' });
  tokens.doctor = doctor.accessToken;
});

afterAll(async () => {
  await teardownDatabase();
});

describe('Appointment Module CRUD', () => {
  it('should create an appointment', async () => {
    const res = await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${tokens.doctor}`)
      .send({ patientId: 1, date: '2025-08-25T10:00:00Z' });
    expect(res.status).toBe(201);
    appointmentId = res.body.id;
  });

  it('should get appointment', async () => {
    const res = await request(app)
      .get(`/appointments/${appointmentId}`)
      .set('Authorization', `Bearer ${tokens.doctor}`);
    expect(res.status).toBe(200);
  });

  it('should update appointment', async () => {
    const res = await request(app)
      .patch(`/appointments/${appointmentId}`)
      .set('Authorization', `Bearer ${tokens.doctor}`)
      .send({ date: '2025-08-25T12:00:00Z' });
    expect(res.status).toBe(200);
  });

  it('should delete appointment', async () => {
    const res = await request(app)
      .delete(`/appointments/${appointmentId}`)
      .set('Authorization', `Bearer ${tokens.doctor}`);
    expect([200, 204]).toContain(res.status);
  });
});
