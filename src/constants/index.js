module.exports = {
    ROLES: {
        SUPER_ADMIN: 'super_admin',
        ADMIN: 'admin',
        DOCTOR: 'doctor',
        NURSE: 'nurse',
        RECEPTION: 'reception',
        BILLING: 'billing',
        LAB: 'lab',
        PHARMACY: 'pharmacy',
    },
    PERMISSIONS: {
        // Users
        USER_READ: 'user.read',
        USER_CREATE: 'user.create',
        USER_UPDATE: 'user.update',
        USER_DELETE: 'user.delete',
        
        // Patients
        PATIENT_READ: 'patient.read',
        PATIENT_CREATE: 'patient.create',
        PATIENT_UPDATE: 'patient.update',
        PATIENT_DELETE: 'patient.delete',
        
        // Appointments
        APPOINTMENT_READ: 'appointment.read',
        APPOINTMENT_CREATE: 'appointment.create',
        APPOINTMENT_UPDATE: 'appointment.update',
        APPOINTMENT_DELETE: 'appointment.delete',
        
        // Billing
        BILL_READ: 'bill.read',
        BILL_CREATE: 'bill.create',
        BILL_UPDATE: 'bill.update',
        BILL_DELETE: 'bill.delete',
        
        // Roles & permissions
        ROLE_READ: 'role.read',
        ROLE_ASSIGN: 'role.assign',
        PERMISSION_READ: 'permission.read',
        PERMISSION_ASSIGN: 'permission.assign',

        //Audit
        AUDIT_READ: 'audit.read',
        AUDIT_CREATE: 'audit.create',

        //Auth
        AUTH_LOGIN: 'auth.login',
        AUTH_LOGOUT: 'auth.logout',
        AUTH_REFRESH: 'auth.refresh',

        //METRICS
        METRICS_READ:'metrics.read'
        
    },
    STATUS: {
        SUCCESS: 'success',
        FAIL: 'fail',
        ERROR: 'error'
    }
};