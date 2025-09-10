export async function seedPermissions(Permission) {
  const permissionKeys = [
    'USER_READ','USER_CREATE','USER_UPDATE','USER_DELETE',
    'PATIENT_READ','PATIENT_CREATE','PATIENT_UPDATE','PATIENT_DELETE',
    'BILL_READ','BILL_CREATE','BILL_UPDATE','BILL_DELETE',
    'APPOINTMENT_READ','APPOINTMENT_CREATE','APPOINTMENT_UPDATE','APPOINTMENT_DELETE',
    'AUDIT_READ','METRICS_READ','ROLE_READ','ROLE_CREATE','PERMISSION_CREATE'
  ];

  const permissions = {};
  for (const key of permissionKeys) {
    const permission = await Permission.create({
      key,
      name: key.replace(/_/g, ' ').toLowerCase()
    });
    permissions[key] = permission;
  }

  console.log('Permissions seeded');
  return permissions;
}
