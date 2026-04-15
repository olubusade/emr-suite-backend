import { sequelize } from './sequelize.js';
import { DataTypes } from 'sequelize';

// Import models
import { UserModel } from '../modules/user/user.model.js';
import { RoleModel } from '../modules/role/role.model.js';
import { PermissionModel } from '../modules/role/permission.model.js';
import { RolePermissionModel } from '../modules/role/rolePermission.model.js';
import { UserPermissionModel } from '../modules/user/userPermission.model.js';
import { PatientModel } from '../modules/patient/patient.model.js';
import { BillModel } from '../modules/bill/bill.model.js';
import { AuditLogModel } from '../modules/audit/auditLog.model.js';
import { RefreshTokenModel } from '../modules/auth/refreshToken.model.js';
import { AppointmentModel } from '../modules/appointment/appointment.model.js';
import { PaymentModel } from '../modules/bill/payment.model.js';
import { UserRoleModel } from '../modules/user/userRole.model.js';
import { VitalModel } from '../modules/vitals/vitals.model.js';
import { ClinicalNoteModel } from '../modules/clinical/clinical.model.js';

// Initialize models
const User = UserModel(sequelize, DataTypes);
const Role = RoleModel(sequelize, DataTypes);
const Permission = PermissionModel(sequelize, DataTypes);
const RolePermission = RolePermissionModel(sequelize, DataTypes);
const UserPermission = UserPermissionModel(sequelize, DataTypes);
const Patient = PatientModel(sequelize, DataTypes);
const Bill = BillModel(sequelize, DataTypes);
const AuditLog = AuditLogModel(sequelize, DataTypes);
const RefreshToken = RefreshTokenModel(sequelize, DataTypes);
const Appointment = AppointmentModel(sequelize, DataTypes);
const Payment = PaymentModel(sequelize, DataTypes);
const UserRole = UserRoleModel(sequelize, DataTypes);

const Vital = VitalModel(sequelize, DataTypes);
const ClinicalNote = ClinicalNoteModel(sequelize, DataTypes);

// ----------------- Associations -----------------
// Multi-roles: User ↔ Role (through UserRole)
User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: 'user_id',
  otherKey: 'role_id',
  as: 'roles',
});
Role.belongsToMany(User, {
  through: UserRole,
  foreignKey: 'role_id',
  otherKey: 'user_id',
  as: 'users',
});

// Role ↔ Permission (through RolePermission)
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'roleId',
  otherKey: 'permissionId',
  as: 'permissions',
});
Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permissionId',
  otherKey: 'roleId',
  as: 'roles',
});
/* Role.associate = models => {
  Role.belongsToMany(models.Permission, {
    through: models.RolePermission,
    foreignKey: 'role_id',
    otherKey: 'permission_id',
    as: 'permissions',
  });
};

Permission.associate = models => {
  Permission.belongsToMany(models.Role, {
    through: models.RolePermission,
    foreignKey: 'permission_id',
    otherKey: 'role_id',
    as: 'roles',
  });
}; */

// User ↔ Permission (through UserPermission)
User.belongsToMany(Permission, {
  through: UserPermission,
  foreignKey: 'userId',
  otherKey: 'permissionId',
  as: 'permissions',
});
Permission.belongsToMany(User, {
  through: UserPermission,
  foreignKey: 'permissionId',
  otherKey: 'userId',
  as: 'users',
});

// Patient ↔ Bill
Patient.hasMany(Bill, { foreignKey: 'patient_id', as: 'bills' });
Bill.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Appointment ↔ Bill
Appointment.hasOne(Bill, { 
  foreignKey: 'appointmentId',
  as: 'bill' 
});

Bill.belongsTo(Appointment, { 
  foreignKey: 'appointmentId',
  as: 'appointment'
});

// Bill ↔ User
Bill.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Bill ↔ Payment
Bill.hasMany(Payment, { foreignKey: 'bill_id', as: 'payments' });
Payment.belongsTo(Bill, { foreignKey: 'bill_id', as: 'bill' });

// Patient ↔ Appointment
Patient.hasMany(Appointment, { foreignKey: 'patient_id', as: 'appointments' });
Appointment.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Patient ↔ User
Patient.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Staff (User) ↔ Appointment
User.hasMany(Appointment, { foreignKey: 'staff_id', as: 'staffAppointments' });
Appointment.belongsTo(User, { foreignKey: 'staff_id', as: 'staff' });

// User ↔ AuditLog
User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'actor' });

// User ↔ RefreshToken
User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Patient ↔ Vitals
Patient.hasMany(Vital, { foreignKey: 'patient_id', as: 'vitals' });
Vital.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Nurse (User) ↔ Vitals
User.hasMany(Vital, { foreignKey: 'nurse_id', as: 'nurseVitals' });
Vital.belongsTo(User, { foreignKey: 'nurse_id', as: 'nurse' });

// Patient Vital ↔ Appointment
Vital.belongsTo(Appointment, { foreignKey: 'appointmentId' });
Appointment.hasOne(Vital, { foreignKey: 'appointmentId' });

// Patient ↔ Clinical Notes
Patient.hasMany(ClinicalNote, { foreignKey: 'patient_id', as: 'clinicalNote' });
ClinicalNote.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Doctor (User) ↔ Clinical Notes
User.hasMany(ClinicalNote, { foreignKey: 'staffId', as: 'doctorNotes' });
ClinicalNote.belongsTo(User, { foreignKey: 'staffId', as: 'doctor' });

// ClinicalNote → Appointment
ClinicalNote.belongsTo(Appointment, {
  foreignKey: 'appointmentId',
  as: 'appointment'
});

// Appointment → ClinicalNote
Appointment.hasOne(ClinicalNote, {
  foreignKey: 'appointmentId',
  as: 'clinicalNote'
});

// ----------------- Exports -----------------
export {
  sequelize,
  User,
  Role,
  Permission,
  RolePermission,
  UserPermission,
  UserRole,        
  Patient,
  Bill,
  AuditLog,
  RefreshToken,
  Appointment,
  Payment,
  Vital,
  ClinicalNote
};
