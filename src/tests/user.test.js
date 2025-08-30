import request from 'supertest';
import app from '../app.js';
import { setupDatabase, teardownDatabase, createTestUser } from './testHelper.js';

let tokens = {};
let userId;

beforeAll(async () => {
  await setupDatabase();
  const admin = await createTestUser({ role: 'admin' });
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
      .send({ email: 'newuser@example.com', full_name: 'New User', password: 'Password123!' });
    expect(res.status).toBe(201);
    userId = res.body.id;
  });

  it('should get user profile', async () => {
    const res = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${tokens.admin}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('admin@example.com');
  });

  it('should update user', async () => {
    const res = await request(app)
      .patch(`/users/${userId}`)
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({ full_name: 'Updated User' });
    expect(res.status).toBe(200);
    expect(res.body.full_name).toBe('Updated User');
  });

  it('should list users', async () => {
    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${tokens.admin}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should delete user', async () => {
    const res = await request(app)
      .delete(`/users/${userId}`)
      .set('Authorization', `Bearer ${tokens.admin}`);
    expect([200, 204]).toContain(res.status);
  });
});
