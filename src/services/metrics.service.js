import { Patient, Bill, User, Appointment, sequelize } from '../models/index.js';
import { QueryTypes } from 'sequelize';

/**
 * Get metrics data for dashboard
 * @param {object} params
 * @param {number} params.months - Number of months to show in trend
 */
export async function getMetricsData({ months = 12 }) {
  const monthsInt = Number(months) || 12;

    // Total metrics (Awaiting promises)
  const [
    patientsCount,
    usersCount,       
    appointmentsCount,  
    revenuePaid,
    revenuePending
  ] = await Promise.all([
    // Total patients
    Patient.count(),
    
    // Total staff/users (from the 'users' table)
    User.count(),
    
    // Total appointments
    Appointment.count(),
    // Revenue Paid
    Bill.sum('amount', { where: { status: 'paid' } }),
    // Revenue Pending
    Bill.sum('amount', { where: { status: 'pending' } })
  ]);

  // Monthly patient trend
  const trendRows = await sequelize.query(
    `
    SELECT 
      to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
      COUNT(*)::int AS visits
    FROM patients
    GROUP BY 1
    ORDER BY 1
    LIMIT $1
    `,
    { bind: [monthsInt], type: QueryTypes.SELECT }
  );

  // Map trend to camelCase
  const trend = trendRows.map(row => ({
    month: row.month,
    visits: row.visits
  }));

   return {
    totals: {
      patients: Number(patientsCount) || 0,
      users: Number(usersCount) || 0,         // ⬅️ Included
      appointments: Number(appointmentsCount) || 0, // ⬅️ Included
      revenuePaid: Number(revenuePaid) || 0,
      revenuePending: Number(revenuePending) || 0
    },
    monthlyPatientTrend: trend // Renamed for clarity
  };
}
