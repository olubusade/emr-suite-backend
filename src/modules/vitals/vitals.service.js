import { Vital, Patient, User, Appointment, sequelize} from '../../config/associations.js'; // 🔑 Added Appointment
import ApiError from '../../shared/utils/ApiError.js';
import { reportError } from '../../shared/utils/monitoring.js';

/**
 * VITALS SERVICE
 * The Triage Engine. Captures patient physiological data and triggers
 * the "Ready for Consultation" state in the clinical workflow.
 */

/**
 * Utility: Calculate BMI and provide clinical interpretation
 */
function calculateBMI(weightKg, heightCm) {
 if (!weightKg || !heightCm || heightCm <= 0) return { bmi: null, category: null };
  
  const heightMeters = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightMeters * heightMeters)).toFixed(1));
  
  let category = 'Normal';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi >= 25 && bmi < 29.9) category = 'Overweight';
  else if (bmi >= 30) category = 'Obese';

  return { bmi, category };
}

/**
 * Retrieves latest triage records across the hospital
 */
/* export async function listVitals({ page = 1, pageSize = 20 }) {
  const limit = Math.min(Number(pageSize) || 20, 100);
  const offset = (Math.max(Number(page) || 1, 1) - 1) * limit; */
export async function listVitals({ limit = 200 }) {
  const safeLimit = Math.min(Number(limit) || 200, 1000);
  
   try { 
     return Vital.findAll({
        limit: safeLimit,
        
        order: [['reading_at', 'DESC']],
        include: [
          {
            model: Patient,
            as:'patient',
            attributes: ['id', 'firstName', 'lastName']
          },
          { model: User, as: 'nurse', attributes: ['id', 'fName', 'lName'] },
          { model: Appointment, attributes: ['id', 'status'] } 
        ],
      });
  } catch (err) {
      reportError(err, { service: 'VitalsService', operation: 'listVitals' });
      throw err;
    }
}


/**
 * Fetch specific triage record with full history context
 */
export async function getVitalById(id) {
  const vital = await Vital.findByPk(id, {
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: ['id', 'firstName', 'lastName']
      },
      { model: User, as: 'nurse', attributes: ['id', 'fName', 'lName'] },
      { model: Appointment, attributes: ['id', 'status'] }
    ],
  });
  if (!vital) throw new ApiError(404, 'Vital record not found');
  return vital;
}

/**
 * Historical View: Get all past vitals for a patient to track trends
 */
export async function getVitalsByPatientId(patientId) {
  const vitals = await Vital.findAll({
    where: { patientId },
    include: [
      { model: User, as: 'nurse', attributes: ['id', 'fName', 'lName'] },
      { model: Appointment, attributes: ['id', 'status', 'appointmentDate'] }
    ],
    order: [['readingAt', 'DESC']]
  });

  return vitals.map(formatVital);
}

export async function getVitalsByAppointment(data) {
  
  const { appointmentId, patientId} = data;
  return await Vital.findOne({
    where: { appointmentId,patientId },
    // Standardized to 'nurse' to match your associations
    include: [{ model: User, as: 'nurse', attributes: ['id','fName', 'lName'] }]
  });
}
/**
 * Create or Update a vital record and advance appointment status.
 * This ensures one visit = one vital record, even with multiple saves.
 */
/**
 * The "Workflow Engine" for Triage.
 * Saves measurements and signals the doctor's queue.
 */
export async function createVital(data) {
  const { appointmentId, patientId, weightKg, heightCm } = data;

  if (!appointmentId || !patientId) {
    throw new ApiError(400, 'Context Missing: Vitals must be linked to a Patient and Appointment.');
  }

  const transaction = await sequelize.transaction();

  try {
    // 1. Calculate clinical derived values
    const { bmi, category } = calculateBMI(weightKg, heightCm);
    const vitalData = { ...data, bmi, notes: data.notes || category };

    // 2. Upsert: One triage record per visit
    const [vital, created] = await Vital.findOrCreate({
      where: { appointmentId },
      defaults: vitalData,
      transaction
    });

    if (!created) {
      await vital.update(vitalData, { transaction });
    }

    // 3.WORKFLOW TRIGGER
    // Transition appointment to 'vitals_taken'. This moves the patient 
    // from the Nurse's list to the Doctor's "Ready" list.
    await Appointment.update(
      { status: 'vitals_taken' },
      { where: { id: appointmentId }, transaction }
    );

    await transaction.commit();
    return getVitalById(vital.id);
  } catch (err) {
    await transaction.rollback();
    reportError(err, { service: 'VitalsService', operation: 'createVital', appointmentId });
    throw err;
  }
}

/**
 * Update logic with re-calculation of BMI
 */
export async function updateVital(id, updates) {
  try {
    const vital = await Vital.findByPk(id);
    if (!vital) throw new ApiError(404, 'Vital record not found');

    if (updates.weightKg || updates.heightCm) {
      const { bmi, category } = calculateBMI(updates.weightKg, updates.heightCm);
      updates.bmi = bmi;
      updates.notes = updates.notes || category;
    }

    
    // Protection: Prevent shifting the record to a different patient/visit
    delete updates.patientId;
    delete updates.appointmentId;

    await vital.update(updates);
    return getVitalById(id);
  } catch (err) {
    reportError(err, { service: 'VitalsService', operation: 'updateVital', vitalId: id });
    throw err;
  }
}

/**
 * Delete a vital record
 */
export async function deleteVital(id) {
  try {
    const deleted = await Vital.destroy({ where: { id } });
    if (!deleted) throw new ApiError(404, 'Vital record not found');
    return true;
  } catch (err) {
    reportError(err, { service: 'VitalsService', operation: 'deleteVital', vitalId: id });
    throw err;
  }
 
}

//----------------------------------------------------------------------------------
//  HELPER FUNCTIONS
//----------------------------------------------------------------------------------  
function isToday(date) {
  const d = new Date(date);
  const today = new Date();

  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

function formatVital(vital) {
  const appointment = vital.Appointment || {};
  const status = appointment.status;

  const isSameDay = isToday(vital.readingAt);

  const isEditableStatus = ['vitals_taken', 'in_consultation'].includes(status);

  const editable = isSameDay && isEditableStatus;
   
  const viewOnly = !editable;


  return {
    id: vital.id,
    patientId: vital.patientId,
    appointmentId: vital.appointmentId,
    temperature: vital.temperature,
    bloodPressure: vital.bloodPressure,
    heartRate: vital.heartRate,
    respiratoryRate: vital.respiratoryRate,
    weightKg: vital.weightKg,
    heightCm: vital.heightCm,
    bmi: vital.bmi,
    spo2: vital.spo2,
    painScale: vital.painScale,
    notes: vital.notes,
    readingAt: vital.readingAt,

    editable,
    viewOnly,

    appointment: {
      id: appointment.id,
      status: appointment.status,
      appointmentDate: appointment.appointmentDate
    },

    nurse: vital.nurse
      ? {
          id: vital.nurse.id,
          name: `${vital.nurse.fName} ${vital.nurse.lName}`
        }
      : null
  };
}
