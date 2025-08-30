import request from 'supertest';
import app from '../app.js';
import { setupDatabase, teardownDatabase, createTestUser } from './testHelper.js';

let tokens = {};
let patientId;

beforeAll(async () => {
  await setupDatabase();
  const doctor = await createTestUser({ role: 'doctor' });
  tokens.doctor = doctor.accessToken;
});

afterAll(async () => {
  await teardownDatabase();
});

describe('Patient Module CRUD', () => {
  it('should create a patient', async () => {
    const res = await request(app)
      .post('/patients')
      .set('Authorization', `Bearer ${tokens.doctor}`)
      .send({ name: 'John Doe', age: 30 });
    expect(res.status).toBe(201);
    patientId = res.body.id;
  });

  it('should get a patient', async () => {
    const res = await request(app)
      .get(`/patients/${patientId}`)
      .set('Authorization', `Bearer ${tokens.doctor}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('John Doe');
  });

  it('should update a patient', async () => {
    const res = await request(app)
      .patch(`/patients/${patientId}`)
      .set('Authorization', `Bearer ${tokens.doctor}`)
      .send({ age: 31 });
    expect(res.status).toBe(200);
    expect(res.body.age).toBe(31);
  });

  it('should delete a patient', async () => {
    const res = await request(app)
      .delete(`/patients/${patientId}`)
      .set('Authorization', `Bearer ${tokens.doctor}`);
    expect([200, 204]).toContain(res.status);
  });
});
