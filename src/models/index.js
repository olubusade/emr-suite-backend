// apps/backend/src/models/index.js
import sequelize from '../config/sequelize.js';
import { DataTypes } from 'sequelize';

import UserModel from './user.model.js';
import RoleModel from './role.model.js';
import PermissionModel from './permission.model.js';
import RolePermissionModel from './rolePermission.model.js';
import UserPermissionModel from './userPermission.model.js';
import PatientModel from './patient.model.js';
import BillModel from './bill.model.js';
import AuditLogModel from './auditLog.model.js';
import RefreshTokenModel from './refreshToken.model.js';
import AppointmentModel from './appointment.model.js';

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

// Associations
Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'role_id', otherKey: 'permission_id' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permission_id', otherKey: 'role_id' });

User.belongsToMany(Permission, { through: UserPermission, foreignKey: 'user_id', otherKey: 'permission_id' });
Permission.belongsToMany(User, { through: UserPermission, foreignKey: 'permission_id', otherKey: 'user_id' });

Patient.hasMany(Bill, { foreignKey: 'patient_id' });
Bill.belongsTo(Patient, { foreignKey: 'patient_id' });

Patient.hasMany(Appointment, { foreignKey: 'patient_id' });
Appointment.belongsTo(Patient, { foreignKey: 'patient_id' });

User.hasMany(Appointment, { foreignKey: 'doctor_id', as: 'DoctorAppointments' });
Appointment.belongsTo(User, { foreignKey: 'doctor_id', as: 'Doctor' });

User.hasMany(AuditLog, { foreignKey: 'actor_id' });
AuditLog.belongsTo(User, { foreignKey: 'actor_id' });

User.hasMany(RefreshToken, { foreignKey: 'user_id' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id' });

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
