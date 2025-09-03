import request from 'supertest';
import app from '../app.js';
import { setupDB, teardownDatabase, createTestUser } from './testHelper.js';

/**
 * Comprehensive integration test for Busade's EMR Demo API
 *
 * Modules covered:
 * - Users (CRUD, profile)
 * Features demonstrated:
 * - RBAC enforcement
 * - End-to-end API behavior
 * - Permission checks
 * - System setup & teardown
 */

let tokens = {};
let createdUserId;

beforeAll(async () => {
  await setupDB();

  // Create an admin user for testing
  const admin = await createTestUser({ role: 'admin', full_name: 'Admin User', email: 'admin@busade-emr-demo.com' });
  tokens.admin = admin.accessToken;
});

afterAll(async () => {
  await teardownDatabase();
});

describe('User Module CRUD', () => {
  it('should create a new user', async () => {
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({
        email: 'newuser@busade-emr-demo.com',
        fullName: 'New User',   // camelCase for API payload
        password: 'Password123!',
        roleId: 2               // Assuming roleId 2 exists for testing
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    createdUserId = res.body.id;
  });

  it('should get admin profile', async () => {
    const res = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('admin@busade-emr-demo.com');
  });

  it('should update created user', async () => {
    const res = await request(app)
      .patch(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({ fullName: 'Updated User' });

    expect(res.status).toBe(200);
    expect(res.body.fullName).toBe('Updated User');
  });

  it('should list all users', async () => {
    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should delete the created user', async () => {
    const res = await request(app)
      .delete(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect([200, 204]).toContain(res.status);
  });
});
