import { v4 as uuidv4 } from 'uuid';

export async function seedVitals(Vital, nurse, appointments) {
  const nurseId = nurse.id;

  // We only seed vitals for appointments that are at the 'vitals_taken' or 'completed' stage
  const vitalsData = appointments
    .filter(app => app.status === 'completed' || app.status === 'vitals_taken')
    .map((app, index) => {
      const heightCm = 175; 
      const weightKg = 70 + index; 
      const heightMeters = heightCm / 100;
      const bmi = (weightKg / (heightMeters * heightMeters)).toFixed(1);

      return {
        id: uuidv4(),
        patientId: app.patientId, // Get the patient associated with this specific appointment
        appointmentId: app.id,    // 🔑 THE LINK: Connecting the measurement to the visit
        nurseId: nurseId, 
        createdBy: nurseId,
        readingAt: app.appointmentDate, 
        bloodPressure: `120/80`,
        heartRate: 72,
        temperature: 36.6,
        respiratoryRate: 18,
        weightKg: weightKg, 
        heightCm: heightCm,
        bmi: bmi,
        spo2: 99,
        painScale: 0,
        notes: `Vitals captured during the scheduled encounter.`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

  if (vitalsData.length > 0) {
    await Vital.bulkCreate(vitalsData);
    console.log(`✅ Demo vitals linked to ${vitalsData.length} appointments created`);
  } else {
    console.log('⚠️ No appointments found in "vitals_taken" or "completed" status to link vitals to.');
  }
}