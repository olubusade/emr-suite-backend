import { Patient, Bill, sequelize } from '../models/index.js';
import { QueryTypes } from 'sequelize';

export async function getMetricsData({ months = 12 }) {
  // Patient count
  const patientsCount = await Patient.count();

  // Revenue
  const revenuePaid = (await Bill.sum('amount', { where: { status: 'PAID' } })) || 0;
  const revenuePending = (await Bill.sum('amount', { where: { status: 'PENDING' } })) || 0;

  // Monthly trend
  const trend = await sequelize.query(
    `
    SELECT 
      to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
      COUNT(*)::int AS visits
    FROM patients
    GROUP BY 1
    ORDER BY 1
    LIMIT $1
    `,
    { bind: [months], type: QueryTypes.SELECT }
  );

  return {
    totals: {
      patients: patientsCount,
      revenuePaid: Number(revenuePaid),
      revenuePending: Number(revenuePending)
    },
    trend
  };
}
