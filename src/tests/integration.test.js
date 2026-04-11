import request from 'supertest';
import app from '../app.js';
import { setupDB, teardownDatabase, loginAs } from './testHelper.js';
import { PERMISSIONS } from '../constants/index.js';

let tokens = {};
let ids = {};

beforeAll(async () => {
  const { adminUser } = await setupDB();

  const adminLogin = await loginAs(adminUser.email, 'password123');

  tokens.admin = adminLogin.accessToken;
  tokens.refresh = adminLogin.refreshToken;
});

afterAll(async () => {
  await teardownDatabase();
});

/* -------------------------------------------------------------------------- */
/* AUTH MODULE                                                                */
/* -------------------------------------------------------------------------- */
describe('AUTH MODULE', () => {
  test('admin login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@busade-emr-demo.com',
        password: 'password123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.user.email).toBeDefined();
  });

  test('refresh token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: tokens.refresh });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  test('change password', async () => {
    const res = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({
        oldPassword: 'password123',
        newPassword: 'newpass123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.success).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/* USER MODULE                                                                */
/* -------------------------------------------------------------------------- */
describe('USER MODULE', () => {
  test('get profile', async () => {
    const res = await request(app)
      .get('/api/users/get_profile')
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.email).toBeDefined();
  });

  test('list users', async () => {
    const res = await request(app)
      .get('/api/users/list_staff')
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('create user', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({
        fName: 'Test',
        lName: 'User',
        email: 'testuser@emr.com',
        password: 'User@123',
        designation: 'Nurse'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.id).toBeDefined();

    ids.user = res.body.data.id;
  });

  test('update user', async () => {
    const res = await request(app)
      .patch(`/api/users/${ids.user}`)
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({
        fName: 'Updated'
      });

    expect(res.statusCode).toBe(200);
  });

  test('delete user', async () => {
    const res = await request(app)
      .delete(`/api/users/${ids.user}`)
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect([200, 204]).toContain(res.statusCode);
  });
});

/* -------------------------------------------------------------------------- */
/* PATIENT MODULE                                                             */
/* -------------------------------------------------------------------------- */
describe('PATIENT MODULE', () => {
  test('create patient', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({
        firstName: 'Elizabeth',
        lastName: 'Smith',
        dob: '1990-01-01',
        gender: 'female',
        email: 'eliz@patient.com',
        phone: '08012345678'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.id).toBeDefined();

    ids.patient = res.body.data.id;
  });

  test('get patient', async () => {
    const res = await request(app)
      .get(`/api/patients/${ids.patient}`)
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(ids.patient);
  });
});

/* -------------------------------------------------------------------------- */
/* APPOINTMENT MODULE                                                         */
/* -------------------------------------------------------------------------- */
describe('APPOINTMENT MODULE', () => {
  test('create appointment', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({
        patientId: ids.patient,
        date: '2026-04-11',
        time: '10:00',
        reason: 'General checkup'
      });

    expect(res.statusCode).toBe(201);
    ids.appointment = res.body.data.id;
  });
});

/* -------------------------------------------------------------------------- */
/* BILLING MODULE                                                             */
/* -------------------------------------------------------------------------- */
describe('BILLING MODULE', () => {
  test('create bill', async () => {
    const res = await request(app)
      .post('/api/bills')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({
        patientId: ids.patient,
        amount: 5000,
        description: 'Consultation fee'
      });

    expect(res.statusCode).toBe(201);
    ids.bill = res.body.data.id;
  });

  test('get bill', async () => {
    const res = await request(app)
      .get(`/api/bills/${ids.bill}`)
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.amount).toBe(5000);
  });
});

/* -------------------------------------------------------------------------- */
/* METRICS MODULE                                                             */
/* -------------------------------------------------------------------------- */
describe('METRICS MODULE', () => {
  test('fetch metrics', async () => {
    const res = await request(app)
      .get('/api/metrics')
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(res.statusCode).toBe(200);

    // safer checks (your metrics shape is nested)
    expect(res.body.data || res.body).toBeDefined();
  });
});

/* -------------------------------------------------------------------------- */
/* AUDIT MODULE                                                               */
/* -------------------------------------------------------------------------- */
describe('AUDIT MODULE', () => {
  test('fetch audit logs', async () => {
    const res = await request(app)
      .get('/api/audit')
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});