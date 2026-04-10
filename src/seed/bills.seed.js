import { v4 as uuidv4 } from 'uuid';

export async function seedBills(Bill, appointments, staff) {
  // 1. Filter only completed appointments
  const completedApps = appointments.filter(a => a.status === 'completed');

  const billsData = completedApps.map((appInstance) => {
    // 2. Convert to plain object to ensure all fields like 'reason' are accessible
    const app = appInstance.get({ plain: true }); 

    const apptDate = new Date(app.appointmentDate);
    const dueDate = new Date(apptDate);
    dueDate.setDate(apptDate.getDate() + 7);

    return {
      id: uuidv4(),
      patientId: app.patientId,
      appointmentId: app.id,
      createdBy: staff.id,
      amount: app.totalAmount || 0, // Fallback to 0 if totalAmount wasn't set
      status: app.paymentStatus === 'fully_paid' ? 'paid' : 
              app.paymentStatus === 'partially_paid' ? 'partially_paid' : 'unpaid',
      paymentMethod: app.paymentStatus === 'fully_paid' ? 'cash' : null,
      dueDate: dueDate,
      // 3. Now app.reason is guaranteed to exist from the Appointment seed
      notes: `Billing generated for ${app.reason || 'General Consultation'}`,
    };
  });

  if (billsData.length === 0) {
    console.log('⚠️ No completed appointments found to bill.');
    return [];
  }

  const created = await Bill.bulkCreate(billsData, { returning: true });
  console.log(`✅ Created ${created.length} bills linked via Appointment ID.`);
  
  return created.map(b => b.get({ plain: true }));
}