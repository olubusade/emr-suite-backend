export async function seedUserPermissions(users, permissions, UserPermission) {
    const records = [];
  
    for (const user of Object.values(users)) {
      for (const perm of Object.values(permissions)) {
        records.push({
          user_id: user.id,
          permission_id: perm.id
        });
      }
    }
  
    await UserPermission.bulkCreate(records);
    console.log('User-Permission mapping completed');
  }
  