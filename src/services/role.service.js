import { Role, Permission } from '../models/index.js';

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

export async function createRole({ name, description }) {
  const exists = await Role.findOne({ where: { name } });
  if (exists) throw { statusCode: 409, message: 'Role already exists' };
  return Role.create({ name, description });
}

export async function createPermission({ name, description }) {
  const exists = await Permission.findOne({ where: { name } });
  if (exists) throw { statusCode: 409, message: 'Permission already exists' };
  return Permission.create({ name, description });
}
