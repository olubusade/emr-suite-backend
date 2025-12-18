import { v4 as uuidv4 } from 'uuid';

export async function seedVitals(Vital, patients, nurse) {
  const nurseId = nurse.id;

  const vitalsData = patients.slice(0, 3).map((patient, index) => {
    const heightCm = 170 + index * 5; 
    const weightKg = 65 + index * 5; 
    const heightMeters = heightCm / 100;
    const bmi = (weightKg / (heightMeters * heightMeters)).toFixed(1);

    return {
      id: uuidv4(),
      patientId: patient.id,
      nurseId: nurseId, 
      readingAt: new Date(Date.now() - index * 60000), 
      bloodPressure: `${110 + index}/${70 + index}`,
      heartRate: 70 + index * 2,
      temperature: 36.5 + index * 0.2,
      respiratoryRate: 16 + index,
      weightKg: weightKg, 
      heightCm: heightCm,
      bmi: bmi,
      spo2: 98 + index,
      painScale: 2 + index,
      notes: `Routine vitals check for patient ${patient.firstName}.`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  await Vital.bulkCreate(vitalsData);
  console.log('✅ Demo vitals created');
}