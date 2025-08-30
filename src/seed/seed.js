// src/seed/seed.js
import { sequelize, Role, Permission, RolePermission, User, Patient, Bill, Appointment } from '../models/index.js';
import bcrypt from 'bcrypt';

async function seed() {
  try {
    // Reset DB (development/demo only!)
    await sequelize.sync({ force: true });
    console.log('Database synced');

    // -------------------- Roles -------------------- //
    const roleNames = ['super_admin','admin','doctor','nurse','reception','billing','lab','pharmacy'];
    const roles = {};
    for (const name of roleNames) {
      roles[name] = await Role.create({ name });
    }
    console.log('Roles seeded');

    // -------------------- Permissions -------------------- //
    const permissionList = [
      'USER_READ','USER_CREATE','USER_UPDATE','USER_DELETE',
      'PATIENT_READ','PATIENT_CREATE','PATIENT_UPDATE','PATIENT_DELETE',
      'BILL_READ','BILL_CREATE','BILL_UPDATE','BILL_DELETE',
      'APPOINTMENT_READ','APPOINTMENT_CREATE','APPOINTMENT_UPDATE','APPOINTMENT_DELETE',
      'AUDIT_READ','METRICS_READ','ROLE_READ','ROLE_CREATE','PERMISSION_CREATE'
    ];
    const permissions = {};
    for (const key of permissionList) {
      permissions[key] = await Permission.create({ key, name: key.replace('_',' ').toLowerCase() });
    }
    console.log('Permissions seeded');

    // -------------------- Role-Permission Mapping -------------------- //
    // Example: super_admin gets all permissions
    await roles.super_admin.addPermissions(Object.values(permissions));
    await roles.admin.addPermissions(Object.values(permissions).filter(p => !p.key.startsWith('ROLE')));
    console.log('Role-Permission mapping completed');

    // -------------------- Default Admin User -------------------- //
    const adminPassword = await bcrypt.hash('password123', 10);
    const adminUser = await User.create({
      full_name: 'Admin User',
      email: 'admin@example.com',
      password_hash: adminPassword,
      role_id: roles.admin.id,
      active: true
    });
    console.log('Admin user created (email: admin@example.com | password: password123)');

    // -------------------- Demo Patients -------------------- //
    const patients = await Patient.bulkCreate([
      { full_name: 'John Doe', age: 35, diagnosis: 'Hypertension' },
      { full_name: 'Jane Smith', age: 28, diagnosis: 'Diabetes' },
      { full_name: 'Alice Johnson', age: 42, diagnosis: 'Asthma' }
    ]);
    console.log('Demo patients created');

    // -------------------- Demo Bills -------------------- //
    await Bill.bulkCreate([
      { patient_id: patients[0].id, amount: 1500, status: 'PAID' },
      { patient_id: patients[1].id, amount: 2500, status: 'PENDING' },
      { patient_id: patients[2].id, amount: 1800, status: 'PAID' }
    ]);
    console.log('Demo bills created');

    // -------------------- Demo Appointments -------------------- //
    await Appointment.bulkCreate([
      { patient_id: patients[0].id, doctor_id: adminUser.id, scheduled_at: new Date(), duration_minutes: 30, reason: 'Routine Checkup', status: 'SCHEDULED' },
      { patient_id: patients[1].id, doctor_id: adminUser.id, scheduled_at: new Date(), duration_minutes: 45, reason: 'Follow-up', status: 'SCHEDULED' },
      { patient_id: patients[2].id, doctor_id: adminUser.id, scheduled_at: new Date(), duration_minutes: 60, reason: 'Lab Results Review', status: 'SCHEDULED' }
    ]);
    console.log('Demo appointments created');

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
