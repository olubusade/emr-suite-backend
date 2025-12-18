export async function seedRolePermissions(roles, permissions, RolePermission) {
  const records = [];

  const rolePermissionMap = {
    super_admin: ['*'], // all permissions
    admin: [
      'USER_READ','USER_CREATE','USER_UPDATE','USER_DELETE',
      'PATIENT_READ','PATIENT_CREATE','PATIENT_UPDATE','PATIENT_DELETE',
      'DOCTOR_READ','NURSE_READ','RECEPTIONIST_READ',
      'APPOINTMENT_READ','APPOINTMENT_CREATE','APPOINTMENT_UPDATE',
      'BILL_READ','BILL_CREATE','BILL_UPDATE','REPORT_READ','REPORT_GENERATE',
      'METRICS_READ','DASHBOARD_VIEW'
    ],
    doctor: [
      'PATIENT_READ','PATIENT_UPDATE','DOCTOR_DASHBOARD_VIEW',
      'DOCTOR_PATIENT_READ','APPOINTMENT_READ','APPOINTMENT_CREATE',
      'APPOINTMENT_UPDATE','CLINICAL_NOTE_CREATE','CLINICAL_NOTE_READ',
      'VITAL_READ','DASHBOARD_VIEW'
    ],
    nurse: [
      'PATIENT_READ','VITAL_CREATE','VITAL_READ','NURSE_DASHBOARD_VIEW',
      'APPOINTMENT_READ','APPOINTMENT_UPDATE','DASHBOARD_VIEW'
    ],
    receptionist: [
      'PATIENT_CREATE','PATIENT_READ','APPOINTMENT_CREATE',
      'APPOINTMENT_READ','APPOINTMENT_UPDATE','BILL_CREATE',
      'BILL_READ','DASHBOARD_VIEW'
    ]
  };

  for (const [roleKey, role] of Object.entries(roles)) {
    const allowedKeys = rolePermissionMap[roleKey];

    if (allowedKeys?.includes('*')) {
      // Super admin gets all
      for (const perm of Object.values(permissions)) {
        records.push({ roleId: role.id, permissionId: perm.id });
      }
      continue;
    }

    // Filter based on allowed permission keys
    for (const key of allowedKeys || []) {
      const perm = permissions[key];
      if (perm) {
        records.push({ roleId: role.id, permissionId: perm.id });
      }
    }
  }

  await RolePermission.bulkCreate(records);
  console.log('Role-Permission mapping completed with RBAC logic');
}
