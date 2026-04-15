import { sequelize, Role, Permission, User, Patient, Bill, Appointment, UserPermission, RolePermission, UserRole, Payment, Vital, ClinicalNote } from '../config/associations.js';

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
import { computeBillStatus } from '../shared/utils/billCompute.js';
import { reportError } from '../shared/utils/monitoring.js';
async function seed() {
  try {
    await sequelize.sync({ force: true });
    
    logger.info('Database synced', {
      service: 'database',
      operation: 'Database Alteration'
    });

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
    
    logger.info('Seed completed successfully', {
      service: 'database',
      operation: 'Seed'
    });
    process.exit(0);

  }catch (err) {
    process.stdout.write('\n❌ CRITICAL SEED FAILURE\n');
    reportError(err, { context: 'Global Seeder Orchestrator' });
    logger.error('Seed failed', { error: err.message });
    process.exit(1);
  }
}

/**
 * Reconciles bill statuses based on finalized payment transactions
 */
export async function syncBillStatuses(Bill, bills, payments) {
  try {
    process.stdout.write('📊 Reconciling bill statuses with payments... ');
    
    const paymentMap = {};
    payments.forEach(p => {
      if (!paymentMap[p.billId]) paymentMap[p.billId] = [];
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

    process.stdout.write('Ledger Synced.\n');
  } catch (err) {
    process.stdout.write('⚠️  Reconciliation failed.\n');
    reportError(err, { context: 'syncBillStatuses' });
  }
}

seed();
