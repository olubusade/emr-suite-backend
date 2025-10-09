import * as metricsService from '../services/metrics.service.js';
import { ok, error } from '../utils/response.js';
import { register } from '../middlewares/metrics.middleware.js'; // Prometheus metrics

/**
 * Get metrics data
 * GET /api/metrics
 */
export async function getMetrics(req, res) {
  try {
    const months = parseInt(req.query.months, 10) || 12;

    // Fetch metrics data from service
     const { totals, monthlyPatientTrend } = await metricsService.getMetricsData({ months }); // ⬅️ Destructure totals and trend

    // Include Prometheus metrics
    const prometheusMetrics = await register.metrics();

    return ok(res, {
      patientCount: totals.patients, 
      userCount: totals.users,
      totalAppointments: totals.appointments, // Assuming you added this to 'totals' in the service
      revenue: totals.revenuePaid, 
      revenuePending: totals.revenuePending,
      // The name 'monthlyTrend' is slightly ambiguous if it only contains patient visits
      // For clarity, it should be renamed or structured:
      monthlyPatientTrend: monthlyPatientTrend, 
      prometheus: prometheusMetrics,
    });
  } catch (err) {
    console.error('metrics.getMetrics:', err);
    return error(res, 500, err.message || 'Internal server error');
  }
}
