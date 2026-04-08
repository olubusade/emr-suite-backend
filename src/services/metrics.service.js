import { Patient, Bill, User, Appointment,Role, sequelize } from '../models/index.js';
import { QueryTypes, where, Op } from 'sequelize';
import { DateTime } from 'luxon';

/**
 * Get metrics data for dashboard
 * @param {object} params
 * @param {number} params.months - Number of months to show in trend
 */
// metrics.service.js

export async function getMetricsData({ months = 12 }) {
  const now = new Date();
  let appointmentWhere = {};
  const monthsInt = Number(months) || 12;
  const start = new Date().setHours(0,0,0,0);
  const end = new Date().setHours(23,59,59,999);
    appointmentWhere.appointmentDate = { [Op.between]: [new Date(start), new Date(end)] };
  // 1. Get Today's date in YYYY-MM-DD format to match your DB column
  const todayISO = DateTime.now().toISODate();

  const [
    patientsCount,
    usersCount,       
    appointmentsCount,  
    revenuePaid,
    revenuePending,
    // 🏥 New Clinical Data
    todaysAppointments,
    patientGroups,
    availableDoctors,
    pendingVitals
  ] = await Promise.all([
    Patient.count(),
    User.count(),
    Appointment.count(),
    Bill.sum('amount', { where: { status: 'paid' } }),
    Bill.sum('amount', { where: { status: 'pending' } }),

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
    Appointment.count({ where: { status: 'awaiting_vitals' } })
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
    },
    clinical: {
      todaysAppointments,
      patientGroups: patientGroups.map((g, i) => ({
        name: g.get('name') || 'General Consultation',
        count: g.get('count'),
        colorClass: ['l-bg-cyan', 'l-bg-orange', 'l-bg-purple', 'l-bg-green'][i % 4]
      }))
    },
    nurse: {
      widgets: {
        todayPatients: todaysAppointments.length,
        pendingVitals: pendingVitals,
        activeDoctors: availableDoctors.filter(d => d.status === 'available').length
      },
      doctors: availableDoctors,
      todaysAppointments,
      patientGroups
    },
    monthlyPatientTrend: trendRows
  };
}
