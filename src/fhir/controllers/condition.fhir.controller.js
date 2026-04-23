import { ClinicalNote } from '../../config/associations.js';
import { mapCondition } from '../services/fhir.mapper.js';

export async function getConditionsFHIR(req, res) {
  const { patient } = req.query;

  const notes = await ClinicalNote.findAll({
    where: { patientId: patient }
  });

  return res.json({
    resourceType: "Bundle",
    entry: notes.map(mapCondition)
  });
}