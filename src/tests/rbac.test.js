// src/test/rbac.comprehensive.test.js
import request from 'supertest';
import app from '../app.js';
import { setupDatabase, teardownDatabase, createTestUser } from './testHelper.js';
import { PERMISSIONS, ROLES } from '../constants/index.js';

let tokens = {};

beforeAll(async () => {
  await setupDatabase();

  // Create users for all roles
  tokens[ROLES.SUPER_ADMIN] = await createTestUser({ role: ROLES.SUPER_ADMIN });
  tokens[ROLES.ADMIN] = await createTestUser({ role: ROLES.ADMIN });
  tokens[ROLES.DOCTOR] = await createTestUser({ role: ROLES.DOCTOR });
  tokens[ROLES.NURSE] = await createTestUser({ role: ROLES.NURSE });
  tokens[ROLES.RECEPTION] = await createTestUser({ role: ROLES.RECEPTION });
  tokens[ROLES.BILLER] = await createTestUser({ role: ROLES.BILLER });
  tokens[ROLES.LAB_TECHNICIAN] = await createTestUser({ role: ROLES.LAB_TECHNICIAN });
  tokens[ROLES.PHARMACIST] = await createTestUser({ role: ROLES.PHARMACIST });
});

afterAll(async () => {
  await teardownDatabase();
});

describe('RBAC - All Modules', () => {
  const modules = [
    {
      name: 'User',
      route: '/api/users',
      permRead: PERMISSIONS.USER_READ,
      permCreate: PERMISSIONS.USER_CREATE,
      permUpdate: PERMISSIONS.USER_UPDATE,
      permDelete: PERMISSIONS.USER_DELETE
    },
    {
      name: 'Patient',
      route: '/api/patients',
      permRead: PERMISSIONS.PATIENT_READ,
      permCreate: PERMISSIONS.PATIENT_CREATE,
      permUpdate: PERMISSIONS.PATIENT_UPDATE,
      permDelete: PERMISSIONS.PATIENT_DELETE
    },
    {
      name: 'Appointment',
      route: '/api/appointments',
      permRead: PERMISSIONS.APPOINTMENT_READ,
      permCreate: PERMISSIONS.APPOINTMENT_CREATE,
      permUpdate: PERMISSIONS.APPOINTMENT_UPDATE,
      permDelete: PERMISSIONS.APPOINTMENT_DELETE
    },
    {
      name: 'Bill',
      route: '/api/bills',
      permRead: PERMISSIONS.BILL_READ,
      permCreate: PERMISSIONS.BILL_CREATE,
      permUpdate: PERMISSIONS.BILL_UPDATE,
      permDelete: PERMISSIONS.BILL_DELETE
    },
    { name: 'Audit', route: '/api/audits', permRead: PERMISSIONS.AUDIT_READ },
    { name: 'Metrics', route: '/api/metrics', permRead: PERMISSIONS.METRICS_READ },
  ];

  modules.forEach(mod => {
    describe(`${mod.name} Module`, () => {
      it('should allow SUPER_ADMIN to access all routes', async () => {
        const res = await request(app)
          .get(mod.route)
          .set('Authorization', `Bearer ${tokens[ROLES.SUPER_ADMIN].accessToken}`);
        expect(res.status).not.toBe(403);
      });

      it('should deny access without token', async () => {
        const res = await request(app).get(mod.route);
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('message');
      });

      if (mod.permRead) {
        it(`should allow roles with ${mod.permRead} permission to read`, async () => {
          const rolesWithRead = [ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTION, ROLES.BILLER, ROLES.LAB_TECHNICIAN, ROLES.PHARMACIST];
          for (const role of rolesWithRead) {
            const res = await request(app)
              .get(mod.route)
              .set('Authorization', `Bearer ${tokens[role].accessToken}`);
            expect([200, 403]).toContain(res.status);
          }
        });
      }

      if (mod.permCreate) {
        it(`should prevent roles without ${mod.permCreate} permission from creating`, async () => {
          const rolesWithoutCreate = [ROLES.NURSE, ROLES.LAB_TECHNICIAN, ROLES.PHARMACIST];
          for (const role of rolesWithoutCreate) {
            const res = await request(app)
              .post(mod.route)
              .send({ dummyData: 'test' })
              .set('Authorization', `Bearer ${tokens[role].accessToken}`);
            expect([200, 403]).toContain(res.status);
            if (res.status === 403) expect(res.body).toHaveProperty('message');
          }
        });
      }

      if (mod.permUpdate) {
        it(`should prevent roles without ${mod.permUpdate} permission from updating`, async () => {
          const rolesWithoutUpdate = [ROLES.RECEPTION, ROLES.LAB_TECHNICIAN, ROLES.PHARMACIST];
          for (const role of rolesWithoutUpdate) {
            const res = await request(app)
              .patch(`${mod.route}/123`)
              .send({ dummyData: 'updated' })
              .set('Authorization', `Bearer ${tokens[role].accessToken}`);
            expect([200, 403]).toContain(res.status);
            if (res.status === 403) expect(res.body).toHaveProperty('message');
          }
        });
      }

      if (mod.permDelete) {
        it(`should prevent roles without ${mod.permDelete} permission from deleting`, async () => {
          const rolesWithoutDelete = [ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTION, ROLES.BILLER, ROLES.LAB_TECHNICIAN, ROLES.PHARMACIST];
          for (const role of rolesWithoutDelete) {
            const res = await request(app)
              .delete(`${mod.route}/123`)
              .set('Authorization', `Bearer ${tokens[role].accessToken}`);
            expect([200, 403]).toContain(res.status);
            if (res.status === 403) expect(res.body).toHaveProperty('message');
          }
        });
      }
    });
  });
});
