export async function seedRolePermissions(roles, permissions, RolePermission) {
  const records = [];

  // super_admin gets all permissions
  for (const perm of Object.values(permissions)) {
    if (!perm?.id) continue; // skip invalid permissions
    records.push({
      roleId: roles.super_admin.id,
      permissionId: perm.id
    });
  }

  // admin gets all except ROLE_READ & ROLE_CREATE
  for (const perm of Object.values(permissions)) {
    const key = perm?.key ?? perm?.dataValues?.key;
    if (!key) continue; // skip if key undefined
    if (!key.startsWith('ROLE')) {
      records.push({
        roleId: roles.admin.id,
        permissionId: perm.id
      });
    }
  }

  await RolePermission.bulkCreate(records);
  console.log('Role-Permission mapping completed');
}
