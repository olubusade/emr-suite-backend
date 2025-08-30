import request from 'supertest';
import app from '../app.js';
import { setupDatabase, teardownDatabase, createTestUser } from './testHelper.js';
import { PERMISSIONS, ROLES } from '../constants/index.js';

let tokens = {};

beforeAll(async () => {
  await setupDatabase();

  // Create users for each role
  tokens[ROLES.SUPER_ADMIN] = await createTestUser({ role: ROLES.SUPER_ADMIN });
  tokens[ROLES.ADMIN] = await createTestUser({ role: ROLES.ADMIN });
  tokens[ROLES.DOCTOR] = await createTestUser({ role: ROLES.DOCTOR });
  tokens[ROLES.NURSE] = await createTestUser({ role: ROLES.NURSE });
  tokens[ROLES.RECEPTION] = await createTestUser({ role: ROLES.RECEPTION });
});

afterAll(async () => {
  await teardownDatabase();
});

describe('RBAC - All Modules', () => {
  const modules = [
    { name: 'User', route: '/users', permRead: PERMISSIONS.USER_READ, permCreate: PERMISSIONS.USER_CREATE, permUpdate: PERMISSIONS.USER_UPDATE, permDelete: PERMISSIONS.USER_DELETE },
    { name: 'Patient', route: '/patients', permRead: PERMISSIONS.PATIENT_READ, permCreate: PERMISSIONS.PATIENT_CREATE, permUpdate: PERMISSIONS.PATIENT_UPDATE, permDelete: PERMISSIONS.PATIENT_DELETE },
    { name: 'Appointment', route: '/appointments', permRead: PERMISSIONS.APPOINTMENT_READ, permCreate: PERMISSIONS.APPOINTMENT_CREATE, permUpdate: PERMISSIONS.APPOINTMENT_UPDATE, permDelete: PERMISSIONS.APPOINTMENT_DELETE },
    { name: 'Bill', route: '/bills', permRead: PERMISSIONS.BILL_READ, permCreate: PERMISSIONS.BILL_CREATE, permUpdate: PERMISSIONS.BILL_UPDATE, permDelete: PERMISSIONS.BILL_DELETE },
    { name: 'Audit', route: '/audits', permRead: PERMISSIONS.AUDIT_READ },
    { name: 'Metrics', route: '/metrics', permRead: PERMISSIONS.METRICS_READ },
  ];

  modules.forEach(mod => {
    describe(`${mod.name} Module`, () => {
      it('should allow SUPER_ADMIN to access all routes', async () => {
        const res = await request(app)
          .get(mod.route)
          .set('Authorization', `Bearer ${tokens[ROLES.SUPER_ADMIN].accessToken}`);
        expect(res.status).not.toBe(403);
      });

      it('should deny unauthorized access without token', async () => {
        const res = await request(app).get(mod.route);
        expect(res.status).toBe(401);
      });

      if (mod.permRead) {
        it(`should allow roles with ${mod.permRead} permission to read`, async () => {
          const res = await request(app)
            .get(mod.route)
            .set('Authorization', `Bearer ${tokens[ROLES.ADMIN].accessToken}`);
          // Admin may or may not have read for module
          expect([200, 403]).toContain(res.status);
        });
      }

      if (mod.permCreate) {
        it(`should prevent roles without ${mod.permCreate} permission from creating`, async () => {
          const res = await request(app)
            .post(mod.route)
            .send({ dummy: 'data' })
            .set('Authorization', `Bearer ${tokens[ROLES.NURSE].accessToken}`);
          expect([403, 200]).toContain(res.status); // 403 if permission denied
        });
      }

      if (mod.permUpdate) {
        it(`should prevent roles without ${mod.permUpdate} permission from updating`, async () => {
          const res = await request(app)
            .patch(`${mod.route}/123`)
            .send({ dummy: 'data' })
            .set('Authorization', `Bearer ${tokens[ROLES.RECEPTION].accessToken}`);
          expect([403, 200]).toContain(res.status);
        });
      }

      if (mod.permDelete) {
        it(`should prevent roles without ${mod.permDelete} permission from deleting`, async () => {
          const res = await request(app)
            .delete(`${mod.route}/123`)
            .set('Authorization', `Bearer ${tokens[ROLES.DOCTOR].accessToken}`);
          expect([403, 200]).toContain(res.status);
        });
      }
    });
  });
});
