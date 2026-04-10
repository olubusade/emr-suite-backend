import { v4 as uuidv4 } from 'uuid';

export async function seedVitals(Vital, nurse, appointments) {
  const nurseId = nurse.id;
  
  // 1. Filter for appointments ready for clinical data
  const eligibleApps = appointments.filter(
    app => app.status === 'completed' || app.status === 'vitals_taken'
  );

  const vitalsData = eligibleApps.map((app, index) => {
    const heightCm = 175;
    const weightKg = 70 + index;
    const bmi = (weightKg / ((heightCm / 100) ** 2)).toFixed(1);

    return {
      id: uuidv4(),
      patientId: app.patientId,
      appointmentId: app.id,
      nurseId: nurseId,
      createdBy: nurseId,
      readingAt: app.appointmentDate,
      bloodPressure: '120/80',
      heartRate: 72,
      temperature: 36.6,
      respiratoryRate: 18,
      weightKg,
      heightCm,
      bmi,
      spo2: 98,
      painScale: 0,
      notes: 'Initial vitals captured.',
    };
  });

  if (vitalsData.length > 0) {
    
    const created = await Vital.bulkCreate(vitalsData, { returning: true });
    console.log(`✅ Created ${created.length} vitals`);
    
    // 🔑 Convert Sequelize instances to plain objects
    return created.map(v => v.get({ plain: true })); 
  }
  return [];
}