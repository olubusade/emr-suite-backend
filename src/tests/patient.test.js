import request from 'supertest';
import app from '../app.js';
import { setupDatabase, teardownDatabase, createTestUser } from './testHelper.js';
/**
 * Store tokens for different user roles
 */

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
      .post('/api/patients')
      .set('Authorization', `Bearer ${tokens.doctor}`)
      .send({ fname: 'John', lname: 'Doe', age: 30 });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    patientId = res.body.data.id;
  });

  it('should get a patient', async () => {
    const res = await request(app)
      .get(`/api/patients/${patientId}`)
      .set('Authorization', `Bearer ${tokens.doctor}`);

    expect(res.status).toBe(200);
    expect(res.body.data.fname).toBe('John');
    expect(res.body.data.lname).toBe('Doe');
  });

  it('should update a patient', async () => {
    const res = await request(app)
      .patch(`/api/patients/${patientId}`)
      .set('Authorization', `Bearer ${tokens.doctor}`)
      .send({ age: 31 });

    expect(res.status).toBe(200);
    expect(res.body.data.age).toBe(31);
  });

  it('should delete a patient', async () => {
    const res = await request(app)
      .delete(`/api/patients/${patientId}`)
      .set('Authorization', `Bearer ${tokens.doctor}`);

    expect([200, 204]).toContain(res.status);
  });
});
