import { v4 as uuidv4 } from 'uuid';

export async function seedClinicalNotes(ClinicalNote, patients, doctor) {
  const notesData = patients.slice(0, 3).map((patient, index) => ({
    id: uuidv4(),
    patientId: patient.id,
    staffId: doctor.id,
    appointmentId: patient.appointments?.[0]?.id || null,
    soap: {
      subjective: `Patient reports mild headache and fatigue (case ${index + 1}).`,
      objective: `Vitals within normal limits. BP ${110 + index}/${70 + index}.`,
      assessment: `Likely tension headache.`,
      plan: `Hydration, rest, and follow-up in 1 week.`,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await ClinicalNote.bulkCreate(notesData);
  console.log('Demo clinical notes created');
}
