import { sequelize, Role, Permission, User, Patient, Bill, Appointment, UserPermission, RolePermission, UserRole, Payment, Vital, ClinicalNote } from '../models/index.js';

import { seedRoles } from './roles.seed.js';
import { seedPermissions } from './permissions.seed.js';
import { seedRolePermissions } from './rolePermission.seed.js';
import { seedUsers } from './users.seed.js';
import { seedUserRoles } from './userRoles.seed.js';
import { seedUserPermissions } from './userPermissions.seed.js';
import { seedPatients } from './patients.seed.js';
import { seedAppointments } from './appointments.seed.js';
import { seedBills } from './bills.seed.js';
import { seedPayments } from './payments.seed.js';
import { seedVitals } from './vitals.seed.js';
import { seedClinicalNotes } from './clinical.seed.js';
import { computeBillStatus } from './../utils/billCompute.js';

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced');

    const roles = await seedRoles(Role);
    const permissions = await seedPermissions(Permission);
    await seedRolePermissions(roles, permissions, RolePermission);
    const users = await seedUsers(User);
    await seedUserRoles(users, roles, UserRole);
    await seedUserPermissions(users, permissions, UserPermission, roles, RolePermission);

    // 1. Seed Patients
    const patients = await seedPatients(Patient, users.admin);

    // 2. Seed Appointments (Store them to link others)
    const appointments = await seedAppointments(Appointment, patients, users.doctor);

    // 3. Seed Vitals (Filtered for the 'completed' appointment)
    const vitals = await seedVitals(Vital, users.nurse, appointments);

    // 4. Seed Clinical Notes (Linked via Vitals -> Appointment)
    await seedClinicalNotes(ClinicalNote, users.doctor, vitals);

    // 5. Seed Bills (Pass appointments here to link Sola's bill to her past visit)
    const bills = await seedBills(Bill, appointments, users.receptionist);

    // 6. Seed Payments
    const payments = await seedPayments(Payment, bills);
    await syncBillStatuses(Bill, bills, payments);
    console.log('Seed completed successfully!');
    process.exit(0);

  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

export async function syncBillStatuses(Bill, bills, payments) {
  const paymentMap = {};

  // Group payments by billId
  payments.forEach(p => {
    if (!paymentMap[p.billId]) {
      paymentMap[p.billId] = [];
    }
    paymentMap[p.billId].push(p);
  });

  for (const bill of bills) {
    const relatedPayments = paymentMap[bill.id] || [];

    const status = computeBillStatus(bill, relatedPayments);

    await Bill.update(
      { status },
      { where: { id: bill.id } }
    );
  }

  console.log('✅ Bill statuses synced with payments');
}

seed();
