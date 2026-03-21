import { v4 as uuidv4 } from 'uuid';

export async function seedAppointments(Appointment, patients, staff) {
  const now = new Date();

  const appointmentsData = [
    // Past Appointment (yesterday)
    {
      id: uuidv4(),
      patientId: patients[0].id,
      staffId: staff.id,
      appointmentDate: new Date(now.getTime() - 24 * 60 * 60 * 1000), // yesterday
      reason: 'Follow-up',
      status: 'completed',
    },
    // Today Appointment
    {
      id: uuidv4(),
      patientId: patients[1].id,
      staffId: staff.id,
      appointmentDate: now, // now
      reason: 'Routine Checkup',
      status: 'scheduled',
    },
    // Upcoming Appointment (tomorrow)
    {
      id: uuidv4(),
      patientId: patients[2].id,
      staffId: staff.id,
      appointmentDate: new Date(now.getTime() + 24 * 60 * 60 * 1000), // tomorrow
      reason: 'Lab Results Review',
      status: 'scheduled',
    },
  ];

  await Appointment.bulkCreate(appointmentsData);
  console.log('Demo appointments seeded: Past, Today, Upcoming');
}