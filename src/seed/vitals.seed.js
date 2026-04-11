import { reportError } from '../utils/monitoring.js';
import { v4 as uuidv4 } from 'uuid';

export async function seedVitals(Vital, nurse, appointments) {
  const nurseId = nurse.id;
  
  // 1. Filter for appointments ready for clinical data
  const eligibleApps = appointments.filter(
    app => app.status === 'completed' || app.status === 'vitals_taken'
  );
  if (eligibleApps.length === 0) {
    process.stdout.write('⚠️  No eligible appointments found for vitals; skipping.\n');
    return [];
  }
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
      notes: 'Standard triage readings captured during intake.',
    };
  });

  try {
    process.stdout.write(`⏳ Recording triage data for ${vitalsData.length} encounters... `);

    const created = await Vital.bulkCreate(vitalsData, { returning: true });

    process.stdout.write('Success (Physiological records synced)\n');
    
    // Return plain objects to avoid Sequelize circular references in subsequent seeders
    return created.map(v => v.get({ plain: true })); 
  } catch (error) {
    process.stdout.write('❌ Failed\n');
    
    reportError(error, { 
      service: 'Seeder', 
      operation: 'seedVitals',
      context: 'Populating triage measurements from appointment list'
    });

    throw error;
  }
}