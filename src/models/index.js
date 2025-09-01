// apps/backend/src/models/index.js

import sequelize from '../config/sequelize.js';
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

// ----------------- Associations -----------------

// Role ↔ User
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

// Role ↔ Permission (through RolePermission)
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'permissions'
});
Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'roles'
});

// User ↔ Permission (through UserPermission)
User.belongsToMany(Permission, {
  through: UserPermission,
  foreignKey: 'user_id',
  otherKey: 'permission_id',
  as: 'permissions'
});
Permission.belongsToMany(User, {
  through: UserPermission,
  foreignKey: 'permission_id',
  otherKey: 'user_id',
  as: 'users'
});

// Patient ↔ Bill
Patient.hasMany(Bill, { foreignKey: 'patient_id', as: 'bills' });
Bill.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Patient ↔ Appointment
Patient.hasMany(Appointment, { foreignKey: 'patient_id', as: 'appointments' });
Appointment.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Staff (User) ↔ Appointment
User.hasMany(Appointment, { foreignKey: 'staff_id', as: 'staffAppointments' });
Appointment.belongsTo(User, { foreignKey: 'staff_id', as: 'staff' });

// User ↔ AuditLog
User.hasMany(AuditLog, { foreignKey: 'actor_id', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'actor_id', as: 'actor' });

// User ↔ RefreshToken
User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ----------------- Exports -----------------
export {
  sequelize,
  User,
  Role,
  Permission,
  RolePermission,
  UserPermission,
  Patient,
  Bill,
  AuditLog,
  RefreshToken,
  Appointment
};
