import { v4 as uuidv4 } from 'uuid';
import { reportError } from '../shared/utils/monitoring.js';

export async function seedAppointments(Appointment, patients, staff) {
  const now = new Date();

  const appointmentsData = [
    // Completed & Fully Paid
    {
      id: uuidv4(),
      patientId: patients[0].id,
      staffId: staff.id,
      createdBy: staff.id,
      appointmentDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      appointmentTime: "09:00",
      reason: 'Hypertension Review',
      notes: "Follow-up consultation",
      type: "consultation",
      status: 'completed',
      paymentStatus: 'fully_paid',
      totalAmount: 15000.00,
      amountPaid: 15000.00
    },

    // Completed but Unpaid (Will show in your new Billing Search)
    {
      id: uuidv4(),
      patientId: patients[0].id,
      staffId: staff.id,
      createdBy: staff.id,
      appointmentDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      appointmentTime: "11:00",
      reason: 'Routine Checkup',
      notes: "General check",
      type: "procedure",
      status: 'completed',
      paymentStatus: 'unpaid',
      totalAmount: 17500.00,
      amountPaid: 0.00
    },

    // Completed & Partially Paid (Will show in your new Billing Search)
    {
      id: uuidv4(),
      patientId: patients[1].id,
      staffId: staff.id,
      createdBy: staff.id,
      appointmentDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      appointmentTime: "10:00",
      reason: 'Malaria Treatment',
      type: "follow_up",
      status: 'completed',
      paymentStatus: 'partially_paid',
      totalAmount: 20000.00,
      amountPaid: 5000.00
    },

    // Scheduled for Today (Not billable yet)
    {
      id: uuidv4(),
      patientId: patients[0].id,
      staffId: staff.id,
      createdBy: staff.id,
      appointmentDate: now,
      appointmentTime: "13:00",
      type: "consultation",
      reason: 'Consultation',
      status: 'scheduled',
      paymentStatus: 'unpaid',
      totalAmount: 0.00,
      amountPaid: 0.00
    }
  ];

  try {
    // Professional Progress Indicator
    process.stdout.write('⏳ Seeding demo appointments... ');

    const createdAppointments = await Appointment.bulkCreate(appointmentsData, { returning: true });

    process.stdout.write('Success (Financial statuses mapped)\n');
    return createdAppointments;
  } catch (error) {
    process.stdout.write('❌ Failed\n');
    
    // Log the error through your monitoring utility for a permanent record
    reportError(error, { 
      service: 'Seeder', 
      operation: 'seedAppointments',
      message: 'Failed to populate demo financial data' 
    });

    throw error; // Re-throw so the main seeder knows to stop
  }
}