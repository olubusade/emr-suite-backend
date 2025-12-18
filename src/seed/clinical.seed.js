import { v4 as uuidv4 } from 'uuid';

export async function seedClinicalNotes(ClinicalNote, patients, doctor) {
  const doctorId = doctor.id; 

  const notesData = patients.slice(0, 3).map((patient, index) => ({
    id: uuidv4(),
    patientId: patient.id,
    staffId: doctorId,
    diagnosis: index === 0 ? 'Tension Headache (G44.2)' : index === 1 ? 'Mild COVID-19 (U07.1)' : 'Acute Pharyngitis (J02.9)',
    subjective: `Patient reports mild headache and fatigue. (Case ${index + 1})`,
    objective: `Vitals stable. BP ${110 + index}/${70 + index}.`,
    assessment: `Likely ${index === 0 ? 'tension headache' : index === 1 ? 'viral infection' : 'sore throat'}.`,
    plan: `Hydration, rest, and follow-up in 1 week.`,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await ClinicalNote.bulkCreate(notesData);
  console.log('✅ Demo clinical notes created');
}