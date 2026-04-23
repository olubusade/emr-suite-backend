import { ClinicalNote, Patient, User } from '../../config/associations.js';
export async function getClinicalNotesFHIR(req, res) {
  const { patient, dateFrom, dateTo } = req.query;

  // =========================
  // BUILD WHERE CLAUSE
  // =========================
  const where = {
    patientId: patient
  };

  if (dateFrom && dateTo) {
    where.createdAt = {
      [Op.between]: [new Date(dateFrom), new Date(dateTo)]
    };
  }

  // =========================
  // QUERY
  // =========================
  const notes = await ClinicalNote.findAll({
    where,
    include: [
      { model: Patient, as: 'patient' },
      { model: User, as: 'doctor' }
    ],
    order: [['createdAt', 'DESC']]
  });

  // =========================
  // FHIR MAPPING
  // =========================
  const entries = notes.map(note => ({
    resource: mapToFHIRComposition(note)
  }));

  return res.json({
    resourceType: 'Bundle',
    type: 'searchset',
    total: entries.length,
    entry: entries
  });
}

function mapToFHIRComposition(note) {
  return {
    resourceType: 'Composition',
    id: note.id,
    status: 'final',

    type: {
      text: 'Clinical Note'
    },

    subject: {
      reference: `Patient/${note.patientId}`
    },

    author: [
      {
        display: `Dr. ${note.doctor?.fName} ${note.doctor?.lName}`
      }
    ],

    date: note.createdAt,

    title: 'Clinical Encounter Note',

    section: [
      {
        title: 'Subjective',
        text: {
          status: 'generated',
          div: `<div>${note.subjective || ''}</div>`
        }
      },
      {
        title: 'Objective',
        text: {
          status: 'generated',
          div: `<div>${note.objective || ''}</div>`
        }
      },
      {
        title: 'Assessment (Diagnosis)',
        text: {
          status: 'generated',
          div: `<div>${note.diagnosis || ''}</div>`
        }
      },
      {
        title: 'Plan',
        text: {
          status: 'generated',
          div: `<div>${note.plan || ''}</div>`
        }
      }
    ]
  };
}