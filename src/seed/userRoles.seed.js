export async function seedUserRoles(users, roles, UserRole) {
  const records = [
    { userId: users.super_admin.id, roleId: roles.super_admin.id },
    { userId: users.admin.id, roleId: roles.admin.id },
    { userId: users.nurse.id, roleId: roles.nurse.id },
    //{ userId: users.nurse.id, roleId: roles.receptionist.id }, // dual role
    { userId: users.receptionist.id, roleId: roles.receptionist.id },
    { userId: users.doctor.id, roleId: roles.doctor.id },
  ];

  await UserRole.bulkCreate(records);
  console.log('User-Role mapping completed');
}
