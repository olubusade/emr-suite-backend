import { v4 as uuidv4 } from 'uuid';

export async function seedVitals(Vital, patients, nurse) {
  const vitalsData = patients.slice(0, 3).map((patient, index) => ({
    id: uuidv4(),
    patientId: patient.id,
    staffId: nurse.id, // nurse who took vitals
    appointmentId: patient.appointments?.[0]?.id || null, // optional if linked
    bloodPressure: `${110 + index}/${70 + index}`,
    heartRate: 70 + index * 2,
    temperature: 36.5 + index * 0.2,
    respirationRate: 16 + index,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await Vital.bulkCreate(vitalsData);
  console.log('Demo vitals created');
}
