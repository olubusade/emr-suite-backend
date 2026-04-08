import { v4 as uuidv4 } from 'uuid';

export async function seedAppointments(Appointment, patients, staff) {
  const now = new Date();

  const appointmentsData = [
    // Past Appointment (yesterday)
    {
      id: uuidv4(),
      patientId: patients[0].id,
      staffId: staff.id,
      createdBy: staff.id,
      appointmentDate: new Date(now.getTime() - 24 * 60 * 60 * 1000), // yesterday
      appointmentTime: "10:30",
      notes: "Follow-up appointment from last month.",
      reason: 'Follow-up',
      status: 'completed',
    },
    // Today Appointment
    {
      id: uuidv4(),
      patientId: patients[1].id,
      staffId: staff.id,
      createdBy: staff.id,
      appointmentDate: now, // now
      appointmentTime: "11:30",
      notes: "Routine checkup appointment.",
      reason: 'Routine Checkup',
      status: 'scheduled',
    },
    // Upcoming Appointment (tomorrow)
    {
      id: uuidv4(),
      patientId: patients[2].id,
      staffId: staff.id,
      createdBy: staff.id,
      appointmentDate: new Date(now.getTime() + 24 * 60 * 60 * 1000), // tomorrow
      appointmentTime: "14:00",
      notes: "Appointment for lab results review.",
      reason: 'Lab Results Review',
      status: 'scheduled',
    },
  ];

  const createdAppointments = await Appointment.bulkCreate(appointmentsData, { returning: true });
  console.log('✅ Demo appointments seeded');
  
  return createdAppointments;
}