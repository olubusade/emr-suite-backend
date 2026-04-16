import { v4 as uuidv4 } from 'uuid';
import { reportError } from '../shared/utils/monitoring.js';

/**
 * SEED CLINICAL NOTES
 * Populates medical documentation linked to triaged patients.
 */
export async function seedClinicalNotes(ClinicalNote, doctor, createdVitals) {
  // Ensure we have an array to map over
  const vitalsArray = Array.isArray(createdVitals) ? createdVitals : [createdVitals];

  if (!vitalsArray.length || !vitalsArray[0]?.id) {
    process.stdout.write('⚠️  No vitals available to link clinical notes; skipping.\n');
    return [];
  }

  const doctorId = doctor.id; 

  const notesData = vitalsArray.map((vital, index) => ({
    id: uuidv4(),
    patientId: vital.patientId,
    appointmentId: vital.appointmentId,
    staffId: doctorId,
    createdBy: doctorId,
    diagnosis: index % 2 === 0 ? 'Hypertension (I10)' : 'Type 2 Diabetes (E11)',
    subjective: 'Patient reports mild fatigue and occasional headaches.',
    objective: `Physiological readings reviewed: BP is ${vital.bloodPressure}, BMI is ${vital.bmi}.`,
    assessment: 'Patient condition appears stable under current regimen.',
    plan: 'Continue current medication. Follow up in 3 months for full metabolic panel.',
  }));

  try {
    process.stdout.write(`⏳ Linking ${notesData.length} clinical notes to triage records... `);

    const created = await ClinicalNote.bulkCreate(notesData, { returning: true });

    process.stdout.write('Success (Medical records synced)\n');
    return created;
  } catch (error) {
    process.stdout.write('❌ Failed\n');
    
    reportError(error, { 
      service: 'Seeder', 
      operation: 'seedClinicalNotes',
      context: 'Populating doctor assessments from vital readings'
    });

    throw error;
  }
}