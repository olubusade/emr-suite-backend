import { Patient } from '../../config/associations.js';
import { mapPatient } from '../services/fhir.mapper.js';

export async function getPatientFHIR(req, res) {
  const patient = await Patient.findByPk(req.params.id);

  if (!patient) {
    return res.status(404).json({ error: "Not found" });
  }

  return res.json(mapPatient(patient));
}