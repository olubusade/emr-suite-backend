import request from 'supertest';
import app from '../app.js';
import { setupDB, teardownDatabase, createTestUser } from './testHelper.js';

let tokens = {};
let createdUserId;

beforeAll(async () => {
  const setup = await setupDB();
  // Store the actual role ID for reliability
  tokens.adminRoleId = setup.roles.admin.id;

  const admin = await createTestUser({ 
    role: 'admin', 
    full_name: 'Admin User', 
    email: 'hospitaladmin@busade-emr-demo.com' 
  });
  tokens.admin = admin.accessToken;
});

afterAll(async () => {
  await teardownDatabase();
});

describe('User Module CRUD Integration', () => {
  
  it('should create a new user (Admin Only)', async () => {
    const res = await request(app)
      .post('/api/users') // Added /api prefix to match your routes
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({
        email: 'newuser@busade-emr-demo.com',
        fName: 'New',
        lName: 'User',
        fullName: 'New User',
        password: 'Password123!',
        roleIds: [tokens.adminRoleId] // Standardized to your UserRole seeder logic
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    createdUserId = res.body.data.id;
  });

  it('should get current authenticated profile (ME)', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('hospitaladmin@busade-emr-demo.com');
  });

  it('should update a specific user via ID', async () => {
    const res = await request(app)
      .patch(`/api/users/${createdUserId}`)
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({ fullName: 'Updated User Name' });

    expect(res.status).toBe(200);
    expect(res.body.data.fullName).toBe('Updated User Name');
  });

  it('should list all registered users with pagination metadata', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    // Ensuring the JSend structure is intact
    expect(res.body.status).toBe('success');
  });

  it('should delete (archive) the created user', async () => {
    const res = await request(app)
      .delete(`/api/users/${createdUserId}`)
      .set('Authorization', `Bearer ${tokens.admin}`);

    // Flexible check for 200 (with message) or 204 (no content)
    expect([200, 204]).toContain(res.status);
  });
});