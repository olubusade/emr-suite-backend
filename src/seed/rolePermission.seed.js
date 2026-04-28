import { reportError } from '../shared/utils/monitoring.js';
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
      'METRICS_READ', 'DASHBOARD_VIEW', 'AUDIT_READ', 'VITAL_CREATE', 'VITAL_READ', 'VITAL_DELETE', 'VITAL_UPDATE', 'CLINICAL_FOLLOWUP_CREATE','CLINICAL_NOTE_READ',
      'FHIR_EXPORT',
      'BREAK_GLASS_APPROVE',
      'BREAK_GLASS_READ',  
      'BREAK_GLASS_REJECT',
      'BREAK_GLASS_EXPIRE',
      'BREAK_GLASS_REVOKE',
      ''
    ],
    doctor: [
      'PATIENT_READ','DOCTOR_DASHBOARD_VIEW',
      'DOCTOR_PATIENT_READ','APPOINTMENT_READ','APPOINTMENT_CREATE',
      'CLINICAL_FOLLOWUP_CREATE', 'CLINICAL_NOTE_CREATE', 'CLINICAL_NOTE_READ',
      'CLINICAL_NOTE_UPDATE', 'CLINICAL_NOTE_DELETE',
      'VITAL_READ','DASHBOARD_VIEW','METRICS_READ','USER_READ'
    ],
    nurse: [
      'PATIENT_READ','VITAL_CREATE','VITAL_READ','VITAL_DELETE','VITAL_UPDATE','NURSE_DASHBOARD_VIEW',
      'APPOINTMENT_READ', 'APPOINTMENT_UPDATE', 'DASHBOARD_VIEW',
      'METRICS_READ', 'USER_READ','CLINICAL_NOTE_READ',
      'BREAK_GLASS_REQUEST', 
    ],
    receptionist: [
      'PATIENT_CREATE','PATIENT_READ','PATIENT_UPDATE','APPOINTMENT_CREATE',
      'APPOINTMENT_READ','APPOINTMENT_UPDATE','BILL_CREATE',
      'BILL_READ','BILL_UPDATE','DASHBOARD_VIEW','METRICS_READ','USER_READ'
    ]
  };

  try {
    process.stdout.write('⏳ Mapping security roles to authority keys... ');

    for (const [roleKey, role] of Object.entries(roles)) {
      const allowedKeys = rolePermissionMap[roleKey];
      if (!allowedKeys) continue;

      // Logic: If a role is being re-seeded, clear its existing permissions first
      // to ensure the rolePermissionMap is the "Single Source of Truth".
      await RolePermission.destroy({ where: { roleId: role.id } });

      if (allowedKeys.includes('*')) {
        for (const perm of Object.values(permissions)) {
          records.push({ roleId: role.id, permissionId: perm.id });
        }
      } else {
        for (const key of allowedKeys) {
          const perm = permissions[key];
          if (perm) {
            records.push({ roleId: role.id, permissionId: perm.id });
          }
        }
      }
    }

    if (records.length > 0) {
      await RolePermission.bulkCreate(records);
    }

    process.stdout.write('Success (RBAC mapping synchronized)\n');
  } catch (error) {
    process.stdout.write('❌ Failed\n');
    
    reportError(error, { 
      service: 'Seeder', 
      operation: 'seedRolePermissions',
      context: 'Synchronizing Role-Permission association table'
    });

    throw error;
  }
}
