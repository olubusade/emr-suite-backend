import { reportError } from '../shared/utils/monitoring.js';

/**
 * SEED USER-PERMISSIONS
 * Flat-maps role-based permissions directly to specific users.
 * This acts as the "Identity Handshake" that enables the middleware
 * to perform high-speed authorization checks.
 */
export async function seedUserPermissions(users, permissions, UserPermission, roles, RolePermission) {
  const records = [];

  try {
    process.stdout.write('⏳ Synchronizing user identity with security matrix... ');

    for (const [roleKey, user] of Object.entries(users)) {
      // Logic: Look up the template role for this specific user category
      const role = roles[roleKey];
      if (!role) continue;

      // Logic: Fetch the "Source of Truth" mappings we just seeded for this role
      const rolePerms = await RolePermission.findAll({ where: { roleId: role.id } });
      
      for (const rp of rolePerms) {
        records.push({
          userId: user.id,
          permissionId: rp.permissionId
        });
      }
    }

    if (records.length > 0) {
      // Logic: Using bulkCreate for performance during the initialization phase
      await UserPermission.bulkCreate(records);
    }

    process.stdout.write('Success (User permissions flattened)\n');
  } catch (error) {
    process.stdout.write('❌ Failed\n');
    
    reportError(error, { 
      service: 'Seeder', 
      operation: 'seedUserPermissions',
      context: 'Mapping security authority from roles to individual demo users'
    });

    throw error;
  }
}