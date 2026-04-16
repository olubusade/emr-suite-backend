import { reportError } from '../shared/utils/monitoring.js';
export async function seedPermissions(Permission) {
  const permissionKeys = [
    // User Management
    "USER_READ","USER_CREATE","USER_UPDATE","USER_DELETE",
    "ROLE_READ","ROLE_CREATE","ROLE_UPDATE","ROLE_DELETE",
    "PERMISSION_READ","PERMISSION_CREATE","PERMISSION_UPDATE","PERMISSION_DELETE",
    "DOCTOR_DASHBOARD_VIEW", "DOCTOR_SETTINGS_MANAGE",
    "NURSE_DASHBOARD_VIEW", "NURSE_SETTINGS_MANAGE",
    "PATIENT_DASHBOARD_VIEW", "PATIENT_SETTINGS_MANAGE",
    "RECEPTIONIST_DASHBOARD_VIEW","RECEPTIONIST_SETTINGS_MANAGE",
    // Patients
    "PATIENT_READ","PATIENT_CREATE","PATIENT_UPDATE","PATIENT_DELETE",
    "PRESCRIPTION_READ","MEDICAL_RECORD_READ","BILLING_VIEW",
    // Doctors
    "DOCTOR_READ","DOCTOR_CREATE","DOCTOR_UPDATE","DOCTOR_DELETE",
    //Doctors-patient
    "DOCTOR_PATIENT_READ","CLINICAL_NOTE_CREATE","CLINICAL_NOTE_READ",'CLINICAL_NOTE_UPDATE',"CLINICAL_NOTE_DELETE","CLINICAL_FOLLOWUP_CREATE",
    // Nurses
    "NURSE_READ","NURSE_CREATE","NURSE_UPDATE","NURSE_DELETE",
    "VITAL_CREATE","VITAL_READ","VITAL_DELETE","VITAL_UPDATE",

    // Receptionists
    "RECEPTIONIST_READ","RECEPTIONIST_CREATE","RECEPTIONIST_UPDATE","RECEPTIONIST_DELETE",

    // Appointments
    "APPOINTMENT_READ","APPOINTMENT_CREATE","APPOINTMENT_UPDATE","APPOINTMENT_DELETE",

    // Bills
    "BILL_READ","BILL_CREATE","BILL_UPDATE","BILL_DELETE",

    // Audit & Reports
    "AUDIT_READ","REPORT_READ","REPORT_GENERATE",

    // Metrics & Dashboard
    "METRICS_READ","DASHBOARD_VIEW"
  ];

  const permissions = {};
  try {
    process.stdout.write(`⏳ Synchronizing ${permissionKeys.length} authority keys... `);

    for (const key of permissionKeys) {
      const [permissionRecord] = await Permission.findOrCreate({
        where: { key },
        defaults: {
          key,
          // Refined formatting: "USER_READ" -> "User Read"
          name: key
            .toLowerCase()
            .split("_")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
        },
      });
      permissions[key] = permissionRecord;
    }

    process.stdout.write('Success (Security matrix initialized)\n');
    return permissions;

  } catch (error) {
    process.stdout.write('❌ Failed\n');
    
    reportError(error, { 
      service: 'Seeder', 
      operation: 'seedPermissions',
      context: 'Initializing RBAC authority keys'
    });

    throw error;
  }
}
