import request from 'supertest';
import app from '../app.js';
import { setupDB, teardownDatabase, createTestUser } from './testHelper.js';
import { PERMISSIONS, ROLES } from '../constants/index.js';
import { v4 as uuidv4 } from 'uuid';

let tokens = {};

beforeAll(async () => {
  await setupDB();

  // Seed one user per role to test the permission matrix
  const roleList = [
    ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR, 
    ROLES.NURSE, ROLES.RECEPTIONIST, ROLES.PATIENT
  ];

  for (const role of roleList) {
    const user = await createTestUser({ 
      role, 
      email: `${role.toLowerCase()}@rbac-test.com`,
      password: 'SecurePassword123!'
    });
    tokens[role] = user.accessToken;
  }
});

afterAll(async () => {
  await teardownDatabase();
});

describe('Cross-Module RBAC Enforcement', () => {
  const modules = [
    { name: 'User', route: '/api/users', permDelete: PERMISSIONS.USER_DELETE },
    { name: 'Patient', route: '/api/patients', permCreate: PERMISSIONS.PATIENT_CREATE },
    { name: 'Clinical Note', route: '/api/clinical-notes', permRead: PERMISSIONS.CLINICAL_NOTE_READ },
    { name: 'Audit', route: '/api/audits', permRead: PERMISSIONS.AUDIT_READ },
    { name: 'Metrics', route: '/api/metrics', permRead: PERMISSIONS.METRICS_READ },
    { name: 'btg', route: '/api/btg', permRead: PERMISSIONS.BREAK_GLASS_READ }
  ];

  modules.forEach(mod => {
    describe(`${mod.name} Module Access Control`, () => {
      
      it(`should grant SUPER_ADMIN full access to ${mod.route}`, async () => {
        const res = await request(app)
          .get(mod.route)
          .set('Authorization', `Bearer ${tokens[ROLES.SUPER_ADMIN]}`);
        
        // Super Admin should never be forbidden
        expect(res.status).not.toBe(403);
      });

      it('should block all unauthorized (non-token) requests', async () => {
        const res = await request(app).get(mod.route);
        expect(res.status).toBe(401);
        expect(res.body.status).toBe('fail');
      });

      // Specific Permission Check: Only Admins/SuperAdmins should delete users
      if (mod.name === 'User') {
        it('should block a Doctor from deleting another user', async () => {
          const fakeId = uuidv4();
          const res = await request(app)
            .delete(`${mod.route}/${fakeId}`)
            .set('Authorization', `Bearer ${tokens[ROLES.DOCTOR]}`);
          
          expect(res.status).toBe(403);
          expect(res.body.message).toMatch(/permission/i);
        });
      }

      // Specific Permission Check: Only Super Admin should see Audit Logs
      if (mod.name === 'Audit') {
        it('should block a Nurse from viewing Audit Logs', async () => {
          const res = await request(app)
            .get(mod.route)
            .set('Authorization', `Bearer ${tokens[ROLES.NURSE]}`);
          
          expect(res.status).toBe(403);
        });
      }
    });
  });
});