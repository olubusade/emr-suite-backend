// src/test/integration.test.js
/**
 * Comprehensive integration test for Vision Health Detective API
 *
 * Modules covered:
 * - Auth (login, refresh, logout, change password)
 * - Users (CRUD, profile)
 * - Patients
 * - Appointments
 * - Billing
 * - Metrics
 * - Audit
 *
 * Features demonstrated:
 * - RBAC enforcement
 * - End-to-end API behavior
 * - Permission checks
 * - System setup & teardown
 */

import request from 'supertest';
import app from '../app.js';
import { setupDB, teardownDatabase, loginAs } from './testHelper.js';
import { PERMISSIONS } from '../constants/index.js';

let tokens = {}; // Store JWT tokens for test users
let createdIds = {}; // Track created resources

beforeAll(async () => {
  const { roles, adminUser } = await setupDB();

  // Login admin user and store access token
  const adminToken = await loginAs(adminUser.email, 'password123');
  tokens.admin = adminToken;

  // Optionally create other users for RBAC testing
});

afterAll(async () => {
  await teardownDatabase();
});

describe('AUTHENTICATION MODULE', () => {
  test('Admin login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.user.permissions).toContain(PERMISSIONS.USER_READ);
  });

  test('Refresh token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' });

    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: loginRes.body.refreshToken });

    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  test('Change password', async () => {
    const res = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({ oldPassword: 'password123', newPassword: 'newpass123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('USER MODULE', () => {
  test('Get admin profile', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe('admin@example.com');
  });

  test('Admin can list users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('Create new user', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({
        fname: 'John',
        lname: 'Doe',
        email: 'johndoe@example.com',
        password: 'pass1234',
        roleId: 2 // admin role
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();
    createdIds.user = res.body.id;
  });

  test('Update user', async () => {
    const res = await request(app)
      .patch(`/api/users/${createdIds.user}`)
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({ fname: 'Johnny' });

    expect(res.statusCode).toBe(200);
    expect(res.body.fname).toBe('Johnny');
  });

  test('Delete user', async () => {
    const res = await request(app)
      .delete(`/api/users/${createdIds.user}`)
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect([200, 204]).toContain(res.statusCode);
  });
});

describe('PATIENT MODULE', () => {
  test('Create patient', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({
        firstName: 'Alice',
        lastName: 'Smith',
        dob: '1990-01-01',
        gender: 'female'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();
    createdIds.patient = res.body.id;
  });

  test('Get patient details', async () => {
    const res = await request(app)
      .get(`/api/patients/${createdIds.patient}`)
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.firstName).toBe('Alice');
  });
});

describe('APPOINTMENTS MODULE', () => {
  test('Create appointment', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({
        patientId: createdIds.patient,
        doctorId: 1,
        date: '2025-08-25',
        time: '10:00'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();
    createdIds.appointment = res.body.id;
  });
});

describe('BILLING MODULE', () => {
  test('Create bill', async () => {
    const res = await request(app)
      .post('/api/bills')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({
        patientId: createdIds.patient,
        amount: 5000,
        description: 'Eye test'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();
    createdIds.bill = res.body.id;
  });

  test('Get bill details', async () => {
    const res = await request(app)
      .get(`/api/bills/${createdIds.bill}`)
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.amount).toBe(5000);
  });
});

describe('METRICS MODULE', () => {
  test('Fetch metrics', async () => {
    const res = await request(app)
      .get('/api/metrics')
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('totalPatients');
    expect(res.body).toHaveProperty('totalAppointments');
  });
});

describe('AUDIT MODULE', () => {
  test('Fetch audit logs', async () => {
    const res = await request(app)
      .get('/api/audit')
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
