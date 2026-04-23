import { Patient, Bill, User, Appointment, BTGRequest, BTGSession, Role, sequelize } from '../../config/associations.js';
import { QueryTypes, where, Op } from 'sequelize';
import { DateTime } from 'luxon';
import { reportError } from '../../shared/utils/monitoring.js';

/**
 * Get metrics data for dashboard
 * @param {object} params
 * @param {number} params.months - Number of months to show in trend
 */
/**
 * METRICS SERVICE
 * Aggregates high-level data for Administrative, Clinical, and Nursing dashboards.
 * Optimized with parallel execution to minimize load times.
 */

export async function getMetricsData({ months = 12 }) {
  const now = new Date();
  let appointmentWhere = {};
  const monthsInt = Number(months) || 12;
  
  //Standardized Time Windows
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todayAppointmentFilter = {
    appointmentDate: {
      [Op.between]: [todayStart, todayEnd]
    }
  };
  
  try {
    const [
      patientsCount,
      usersCount,       
      appointmentsCount,  
      revenuePaid,
      revenuePending,
      pendingBTGCount,
      activeBTGSessionCount,
      approvedBTGCount,
      rejectedBTGCount,
      // 🏥 New Clinical Data
      todaysAppointments,
      patientGroups,
      availableDoctors,
      pendingVitals,
      vitalsTakenToday,
      readyForConsultationCount,
      completedConsultation
    ] = await Promise.all([
      Patient.count(),
      User.count(),
      Appointment.count(),
      Bill.sum('amount', { where: { status: 'paid' } }),
      Bill.sum('amount', { where: { status: 'pending' } }),
      // BTG Metrics
      BTGRequest.count({ where: { status: 'PENDING' } }),
      BTGRequest.count({
  where: {
    status: 'APPROVED',
    expiresAt: { [Op.gt]: new Date() }
  }
      }),
      BTGRequest.count({
  where: {
    status: 'REJECTED'
  }
}),
      BTGSession.count({ where: { status: 'ACTIVE' } }),
      // Fetch Today's Appointments with Patient Details
      Appointment.findAll({
        order: [['appointmentDate', 'DESC']], 
        limit: 10,
        where: appointmentWhere,
        include: [{
          model: Patient,
          as: 'patient',
          attributes: ['firstName', 'lastName', 'gender','email', 'profileImage']
        }]
      }),

      Appointment.findAll({
        attributes: [
          ['reason', 'name'], 
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: { reason: { [Op.ne]: null } },
        group: ['reason'],
        limit: 5
      }),
      // Fetch Doctors for the Nurse's "Doctors List"
      User.findAll({
        attributes: ['fName', 'lName', 'active', 'designation'], // Columns from User
        include: [
          {
            model: Role,
            as: 'roles',
            where: { name: 'doctor' },
            attributes: [],
            through: { attributes: [] }
          }
        ],
        limit: 5
      }),
      // Fetch appointments that need vitals taken (example status)
      Appointment.count({ where: { status: 'scheduled',... todayAppointmentFilter  } }),
      //Ready for Doctor: Vitals are done, now waiting for the doctor
      Appointment.count({ where: { status: 'vitals_taken', ... appointmentWhere } }),
      Appointment.count({ where: { status: 'vitals_taken' } }),
      Appointment.count({where: { status: 'completed', ...todayAppointmentFilter}}),
    ]);

    const trendRows = await sequelize.query(
      `SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month, COUNT(*)::int AS visits FROM patients GROUP BY 1 ORDER BY 1 LIMIT $1`,
      { bind: [monthsInt], type: QueryTypes.SELECT }
    );
    
    return {
      totals: {
        patients: Number(patientsCount) || 0,
        users: Number(usersCount) || 0,
        appointments: Number(appointmentsCount) || 0,
        revenuePaid: Number(revenuePaid) || 0,
        revenuePending: Number(revenuePending) || 0,
        pendingBTGCount: Number(pendingBTGCount) || 0,
        activeBTGSessionCount: Number(activeBTGSessionCount) || 0,
        approvedBTGCount: Number(approvedBTGCount) || 0,
        rejectedBTGCount: Number(rejectedBTGCount) || 0,
      },
      clinical: {
        todaysAppointments,
        completedConsultation,
        patientGroups: patientGroups.map((g, i) => ({
          name: g.get('name') || 'General Consultation',
          count: g.get('count'),
          colorClass: ['l-bg-cyan', 'l-bg-orange', 'l-bg-purple', 'l-bg-green'][i % 4]
        }))
      },
      nurse: {
        widgets: {
          todayPatients: appointmentsCount,
          pendingVitals,
          vitalsTakenToday,
          readyForDoctor: readyForConsultationCount,
          activeDoctors: availableDoctors.filter(d => d.status === 'available').length
        },
        doctors: availableDoctors,
        todaysAppointments,
        patientGroups
      },
      monthlyPatientTrend: trendRows
    };
  } catch (err) {
    reportError(err, { service: 'MetricsService', operation: 'getMetricsData' });
    throw err;
  }
  
}
