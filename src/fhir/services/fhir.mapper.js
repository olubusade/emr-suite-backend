export function mapPatient(patient) {
  return {
    resourceType: "Patient",
    id: patient.id,
    name: {
      fullName: `${patient.firstName} ${patient.lastName}`
    },
    gender: patient.gender,
    birthDate: patient.dob
  };
}

export function mapObservation(vital) {
  return {
    resourceType: "Observation",
    id: vital.id,
    patientId: vital.patientId,
    code: vital.type, // BP, HR, TEMP
    value: vital.value,
    unit: vital.unit,
    effectiveDateTime: vital.createdAt
  };
}

export function mapCondition(note) {
  return {
    resourceType: "Condition",
    id: note.id,
    patientId: note.patientId,
    clinicalStatus: "active",
    diagnosis: note.diagnosis,
    recordedDate: note.createdAt
  };
}

export function mapClinicalNoteFHIR(note) {
  return {
    resourceType: "ClinicalImpression",
    id: note.id,
    status: "completed",
    subject: {
      reference: `Patient/${note.patientId}`
    },
    summary: note.diagnosis,
    description: note.plan,
    effectiveDateTime: note.createdAt
  };
}