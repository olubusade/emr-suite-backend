import { v4 as uuidv4 } from 'uuid';

export async function seedClinicalNotes(ClinicalNote, patients, doctor, appointments) {
  const doctorId = doctor.id; 

  // We only seed notes for appointments that are 'completed' or 'in_consultation'
  const notesData = appointments
    .filter(app => app.status === 'completed' || app.status === 'scheduled')
    .map((app, index) => ({
      id: uuidv4(),
      patientId: app.patientId,
      appointmentId: app.id, // 🔑 THE LINK: Legal record for this specific visit
      staffId: doctorId,
      diagnosis: index === 0 ? 'Tension Headache (G44.2)' : 'Acute Pharyngitis (J02.9)',
      subjective: `Patient complains of persistent symptoms since yesterday.`,
      objective: `Physical exam shows normal reflex responses. Heart rate and temperature are within range.`,
      assessment: `Condition appears stable; initial diagnosis confirmed.`,
      plan: `Prescribed rest and 500mg Paracetamol. Follow-up if symptoms persist beyond 72 hours.`,
      createdAt: new Date(),
      createdBy: doctorId,
      updatedAt: new Date(),
    }));

  if (notesData.length > 0) {
   const createdClinicalNote = await ClinicalNote.bulkCreate(notesData);
    console.log(`✅ Demo clinical notes linked to ${notesData.length} appointments.`);
    return createdClinicalNote;
  }
}
