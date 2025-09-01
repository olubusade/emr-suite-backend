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
    const data = await metricsService.getMetricsData({ months });

    // Include Prometheus metrics
    const prometheusMetrics = await register.metrics();

    return ok(res, {
      ...data,
      prometheus: prometheusMetrics,
    });
  } catch (err) {
    console.error('metrics.getMetrics:', err);
    return error(res, 500, err.message || 'Internal server error');
  }
}
