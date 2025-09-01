import { Role, Permission } from '../models/index.js';
import ApiError from '../utils/ApiError.js';

/**
 * Get role-permission matrix
 */
export async function getRoleMatrix() {
  const roles = await Role.findAll({ order: [['name', 'ASC']] });
  const permissions = await Permission.findAll({ order: [['name', 'ASC']] });

  const matrix = await Promise.all(
    roles.map(async (role) => {
      const rolePerms = await role.getPermissions();
      const enabledNames = rolePerms.map(p => p.name);

      return {
        role: role.name,
        permissions: permissions.map(p => ({
          name: p.name,
          enabled: enabledNames.includes(p.name)
        }))
      };
    })
  );

  return {
    roles: roles.map(r => r.name),
    permissions: permissions.map(p => p.name),
    matrix
  };
}

/**
 * Create a new role
 */
export async function createRole({ name, description }) {
  const exists = await Role.findOne({ where: { name } });
  if (exists) throw new ApiError(409, 'Role already exists');

  const role = await Role.create({ name, description });
  return { id: role.id, name: role.name, description: role.description };
}

/**
 * Create a new permission
 */
export async function createPermission({ name, description }) {
  const exists = await Permission.findOne({ where: { name } });
  if (exists) throw new ApiError(409, 'Permission already exists');

  const permission = await Permission.create({ name, description });
  return { id: permission.id, name: permission.name, description: permission.description };
}
