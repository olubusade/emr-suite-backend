export async function seedRolePermissions(roles, permissions, RolePermission) {
    const RolePermissionRecords = [];
  
    // super_admin gets all permissions
    for (const perm of Object.values(permissions)) {
      if (!perm?.id) continue; // skip invalid permissions
      RolePermissionRecords.push({
        role_id: roles.super_admin.id,
        permission_id: perm.id
      });
    }
  
    // admin gets all except ROLE_READ & ROLE_CREATE
    for (const perm of Object.values(permissions)) {
      const key = perm?.key ?? perm?.dataValues?.key;
      if (!key) continue; // skip if key undefined
      if (!key.startsWith('ROLE')) {
        RolePermissionRecords.push({
          role_id: roles.admin.id,
          permission_id: perm.id
        });
      }
    }
  
    await RolePermission.bulkCreate(RolePermissionRecords);
    console.log('Role-Permission mapping completed');
  }
  