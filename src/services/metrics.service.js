import { Patient, Bill, sequelize } from '../models/index.js';
import { QueryTypes } from 'sequelize';

/**
 * Get metrics data for dashboard
 * @param {object} params
 * @param {number} params.months - Number of months to show in trend
 */
export async function getMetricsData({ months = 12 }) {
  const monthsInt = Number(months) || 12;

  // Total patients
  const patientsCount = await Patient.count();

  // Revenue
  const revenuePaid = Number(await Bill.sum('amount', { where: { status: 'PAID' } })) || 0;
  const revenuePending = Number(await Bill.sum('amount', { where: { status: 'PENDING' } })) || 0;

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
      patients: patientsCount,
      revenuePaid,
      revenuePending
    },
    trend
  };
}
