import { v4 as uuidv4 } from 'uuid';

export async function seedClinicalNotes(ClinicalNote, doctor, createdVitals) {
  // Ensure we have an array to map over
  const vitalsArray = Array.isArray(createdVitals) ? createdVitals : [createdVitals];

  if (!vitalsArray.length || !vitalsArray[0].id) {
    console.log('⚠️ No vitals available to link clinical notes to. Skipping...');
    return [];
  }

  const doctorId = doctor.id; 

  const notesData = vitalsArray.map((vital, index) => ({
    id: uuidv4(),
    patientId: vital.patientId,
    appointmentId: vital.appointmentId,
    staffId: doctorId,    // This was null because of the parameter shift
    createdBy: doctorId,
    diagnosis: index % 2 === 0 ? 'Hypertension (I10)' : 'Type 2 Diabetes (E11)',
    subjective: 'Patient reports mild fatigue.',
    objective: `BP is ${vital.bloodPressure}, BMI is ${vital.bmi}.`,
    assessment: 'Patient stable.',
    plan: 'Maintain current medication.',
  }));

  if (notesData.length > 0) {
    await ClinicalNote.bulkCreate(notesData);
    console.log(`✅ Linked ${notesData.length} notes to existing vital records.`);
  }
}