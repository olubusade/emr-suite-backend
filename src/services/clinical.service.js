import { ClinicalNote, Patient, User, Appointment } from '../models/index.js';

/**
 * List clinical notes
 */
export async function listClinicalNotes({ limit = 200 }) {
  const safeLimit = Math.min(Number(limit) || 200, 1000);

  return ClinicalNote.findAll({
    order: [['createdAt', 'DESC']],
    limit: safeLimit,
    include: [
      { model: Patient, attributes: ['id', 'full_name'] },
      { model: User, as: 'doctor', attributes: ['id', 'full_name', 'email'] }
    ]
  });
}

/**
 * Get single clinical note
 */
export async function getClinicalNotesById(id) {
  return ClinicalNote.findByPk(id, {
    include: [
      { model: Patient, as:'patient', attributes: ['id', 'firstName','lastName'] },
      { model: User, as: 'doctor', attributes: ['id','fName','lName', 'fullName', 'email'] }
    ]
  });
}

/**
 * Get clinical notes by patient ID
 */
export async function getClinicalNotesByPatientId(patientId) {
  return await ClinicalNote.findAll({
    where: { patientId },
    include: [
      { 
        model: User, 
        as: 'doctor',
        attributes: ['id', 'fName', 'lName'] 
      },
      { 
        model: Appointment, 
        attributes: ['id', 'appointmentDate', 'status'] 
      }
    ],
    order: [['createdAt', 'DESC']]
  });
}

export async function getClinicalNotesByAppointmentId(data) {
  const { appointmentId, patientId} = data;
  return await ClinicalNote.findAll({
    where: { appointmentId,patientId },
    include: [
      { 
        model: User, 
        as: 'doctor',
        attributes: ['id', 'fName', 'lName'] 
      },
      { 
        model: Appointment, 
        attributes: ['id', 'appointmentDate', 'status'] 
      }
    ],
    order: [['createdAt', 'DESC']]
  });
}

/**
 * Create or Update a Clinical Note
 * This follows the "Workflow Engine" pattern to move the appointment forward.
 */
export async function createClinicalNote(data) {
  const { appointmentId, patientId, createdBy } = data;

  // 1. Context Validation
  if (!appointmentId || !patientId || !createdBy) {
    throw new ApiError(400, 'Appointment, Patient, and Provider context are required.');
  }

  // 2. Existence Check
  const appointment = await Appointment.findByPk(appointmentId);
  if (!appointment) throw new ApiError(404, 'Appointment not found.');

  // 3. Save the Record (Upsert Pattern)
  // We use findOrCreate or a specific check to prevent duplicate notes for one visit
  const [note, created] = await ClinicalNote.findOrCreate({
    where: { appointmentId },
    defaults: data
  });

  if (!created) {
    // If it already exists, we update it (The "Save & Continue" workflow)
    await note.update(data);
  }

  // 4. Status Bump - Moves the patient from 'consultation' to 'completed' (or 'pending_pharmacy')
  // This is the engine that clears the doctor's "Waiting Room" list
  await Appointment.update(
    {
      status: 'completed',
      paymentStatus: 'unpaid' // Ensures they hit the 'Pending Bills' search
     }, 
    { where: { id: appointmentId } }
  );

  return getClinicalNotesById(note.id);
}

/**
 * Update Clinical Note
 * Uses a "Clean Update" strategy to handle multiple fields efficiently.
 */
export async function updateClinicalNote(id, updates) {
  const clinical = await ClinicalNote.findByPk(id);
  
  if (!clinical) {
    throw new ApiError(404, 'Clinical note not found');
  }

  // 1. Safety Check: Is the appointment already completed/locked?
  // In many EMRs, you cannot edit a note once the encounter is signed.
  const appointment = await Appointment.findByPk(clinical.appointmentId);
  if (appointment?.status === 'finalized') {
    throw new ApiError(403, 'Cannot edit a finalized clinical note.');
  }

  // 2. Bulk Assignment
  // This automatically updates only the fields present in the 'updates' object
  await clinical.update(updates);

  // 3. Return the fresh record with all associations (Patient, Doctor, etc.)
  return getClinicalNotesById(clinical.id);
}

/**
 * Delete clinical note
 */
export async function deleteClinicalNote(id) {
  const clinical = await ClinicalNote.findByPk(id);
  if (!clinical) throw new Error('Clinical note not found');

  await clinical.destroy();
  return clinical;
}
