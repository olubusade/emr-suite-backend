import { v4 as uuidv4 } from 'uuid';
import { reportError } from '../utils/monitoring.js';

export async function seedBills(Bill, appointments, staff) {
  // 1. Filter only completed appointments
  const completedApps = appointments.filter(a => a.status === 'completed');

  if (completedApps.length === 0) {
    process.stdout.write('⚠️  No completed appointments found; skipping Bill seeding.\n');
    return [];
  }

  const billsData = completedApps.map((appInstance) => {
    // 2. Convert to plain object
    const app = appInstance.get({ plain: true });

    const apptDate = new Date(app.appointmentDate);
    const dueDate = new Date(apptDate);
    dueDate.setDate(apptDate.getDate() + 7);

    // 3. Simplified status logic
    const status = app.paymentStatus === 'fully_paid' ? 'paid' : 'pending';

    return {
      id: uuidv4(),
      patientId: app.patientId,
      appointmentId: app.id,
      createdBy: staff.id,
      amount: app.totalAmount || 0,
      status,
      paymentMethod: status === 'paid' ? 'cash' : null,
      dueDate,
      notes: `Billing generated for ${app.reason || 'General Consultation'}`,
    };
  });

  try {
    process.stdout.write(`⏳ Generating ${billsData.length} financial records... `);

    const created = await Bill.bulkCreate(billsData, { returning: true });

    process.stdout.write('Success (Billing synced with Appointments)\n');

    return created.map(b => b.get({ plain: true }));
  } catch (error) {
    process.stdout.write('❌ Failed\n');

    reportError(error, { 
      service: 'Seeder', 
      operation: 'seedBills',
      context: 'Generating bills from appointment demo data'
    });

    throw error;
  }
}