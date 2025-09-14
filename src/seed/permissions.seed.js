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
    "DOCTOR_PATIENT_READ",
    // Nurses
    "NURSE_READ","NURSE_CREATE","NURSE_UPDATE","NURSE_DELETE",

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
  for (const key of permissionKeys) {
    const permission = await Permission.findOrCreate({
      where: { key },
      defaults: {
        key,
        // Convert "USER_READ" -> "User Read"
        name: key
          .split("_")
          .map(word => word.charAt(0) + word.slice(1).toLowerCase())
          .join(" "),
      },
    });
    permissions[key] = permission[0];
  }

  console.log("Permissions seeded successfully");
  return permissions;
}
