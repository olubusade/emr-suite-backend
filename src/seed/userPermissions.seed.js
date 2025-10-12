export async function seedUserPermissions(users, permissions, UserPermission, roles, RolePermission) {
  const records = [];

  for (const [roleKey, user] of Object.entries(users)) {
    // Get all role-permission mappings for this role
    const role = roles[roleKey];
    if (!role) continue;

    const rolePerms = await RolePermission.findAll({ where: { roleId: role.id } });
    for (const rp of rolePerms) {
      records.push({
        userId: user.id,
        permissionId: rp.permissionId
      });
    }
  }

  await UserPermission.bulkCreate(records);
  console.log('User-Permission mapping completed (role-based) ✅');
}
