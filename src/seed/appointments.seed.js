import { v4 as uuidv4 } from 'uuid';

export async function seedAppointments(Appointment, patients, staff) {
  const now = new Date();

  const appointmentsData = [
    {
      id: uuidv4(),
      patientId: patients[0].id,  // camelCase
      staffId: staff.id,           // camelCase
      appointmentDate: new Date(now.getTime() + 3600 * 1000),
      reason: 'Routine Checkup',
      status: 'scheduled',
    },
    {
      id: uuidv4(),
      patientId: patients[1].id,
      staffId: staff.id,
      appointmentDate: new Date(now.getTime() + 7200 * 1000),
      reason: 'Follow-up',
      status: 'scheduled',
    },
    {
      id: uuidv4(),
      patientId: patients[2].id,
      staffId: staff.id,
      appointmentDate: new Date(now.getTime() + 10800 * 1000),
      reason: 'Lab Results Review',
      status: 'scheduled',
    },
  ];

  await Appointment.bulkCreate(appointmentsData);
  console.log('Demo appointments created');
}
