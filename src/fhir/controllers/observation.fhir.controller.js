import { Vital } from '../../config/associations.js';
import { mapObservation } from '../services/fhir.mapper.js';

export async function getObservationsFHIR(req, res) {
  const { patient } = req.query;

  const data = await Vital.findAll({
    where: { patientId: patient }
  });

  return res.json({
    resourceType: "Bundle",
    entry: data.map(mapObservation)
  });
}