import { reportError } from '../utils/monitoring.js';

/**
 * SEED USER-ROLES
 * The Final Association. Connects personnel to their organizational scope.
 * Enables the multi-role capabilities of the EMR security engine.
 */
export async function seedUserRoles(users, roles, UserRole) {
  // Logic: Map the established user IDs to their role containers
  const records = [
    { userId: users.super_admin.id, roleId: roles.super_admin.id },
    { userId: users.admin.id, roleId: roles.admin.id },
    { userId: users.nurse.id, roleId: roles.nurse.id },
    { userId: users.receptionist.id, roleId: roles.receptionist.id },
    { userId: users.doctor.id, roleId: roles.doctor.id },
    
    // Example: To test multi-role logic, you can add a user to a second role:
    // { userId: users.nurse.id, roleId: roles.receptionist.id }, 
  ];

  try {
    process.stdout.write('⏳ Assigning personnel to organizational roles... ');

    // Logic: Using bulkCreate for speed and transactional consistency
    await UserRole.bulkCreate(records);

    process.stdout.write('Success (Staff access levels finalized)\n');
  } catch (error) {
    process.stdout.write('❌ Failed\n');
    
    reportError(error, { 
      service: 'Seeder', 
      operation: 'seedUserRoles',
      context: 'Finalizing User-Role associations in the RBAC matrix'
    });

    throw error;
  }
}