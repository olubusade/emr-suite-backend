import { sequelize } from '../config/sequelize.js';
import { DataTypes } from 'sequelize';

// Import models
import { UserModel } from './user.model.js';
import { RoleModel } from './role.model.js';
import { PermissionModel } from './permission.model.js';
import { RolePermissionModel } from './rolePermission.model.js';
import { UserPermissionModel } from './userPermission.model.js';
import { PatientModel } from './patient.model.js';
import { BillModel } from './bill.model.js';
import { AuditLogModel } from './auditLog.model.js';
import { RefreshTokenModel } from './refreshToken.model.js';
import { AppointmentModel } from './appointment.model.js';
import { PaymentModel } from './payment.model.js';
import { UserRoleModel } from './userRole.model.js';
import { VitalModel } from './vitals.model.js';
import { ClinicalNoteModel } from './clinical.model.js';

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
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'permissions',
});
Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'roles',
});

// User ↔ Permission (through UserPermission)
User.belongsToMany(Permission, {
  through: UserPermission,
  foreignKey: 'user_id',
  otherKey: 'permission_id',
  as: 'permissions',
});
Permission.belongsToMany(User, {
  through: UserPermission,
  foreignKey: 'permission_id',
  otherKey: 'user_id',
  as: 'users',
});

// Patient ↔ Bill
Patient.hasMany(Bill, { foreignKey: 'patient_id', as: 'bills' });
Bill.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

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

// Patient ↔ Clinical Notes
Patient.hasMany(ClinicalNote, { foreignKey: 'patient_id', as: 'clinicalNotes' });
ClinicalNote.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Doctor (User) ↔ Clinical Notes
User.hasMany(ClinicalNote, { foreignKey: 'doctor_id', as: 'doctorNotes' });
ClinicalNote.belongsTo(User, { foreignKey: 'doctor_id', as: 'doctor' });

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
