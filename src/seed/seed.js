import { sequelize, Role, Permission, User, Patient, Bill, Appointment, UserPermission, RolePermission } from '../models/index.js';

import { seedRoles } from './roles.seed.js';
import { seedPermissions } from './permissions.seed.js';
import { seedRolePermissions } from './rolePermission.seed.js';
import { seedUsers } from './users.seed.js';
import { seedUserPermissions } from './userPermissions.seed.js';
import { seedPatients } from './patients.seed.js';
import { seedAppointments } from './appointments.seed.js';
import { seedBills } from './bills.seed.js';

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log('✅ Database synced');

    const roles = await seedRoles(Role);
    const permissions = await seedPermissions(Permission);

    await seedRolePermissions(roles, permissions, RolePermission);

    const users = await seedUsers(User, roles);

    await seedUserPermissions(users, permissions, UserPermission);

    const patients = await seedPatients(Patient, users.adminUser);

    await seedAppointments(Appointment, patients, users.adminUser);

    await seedBills(Bill, patients, users.adminUser);

    console.log('🎉 Seed completed successfully!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
