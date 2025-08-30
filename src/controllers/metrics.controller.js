import * as metricsService from '../services/metrics.service.js';
import { ok, error } from '../utils/response.js';
import { register } from '../middlewares/metrics.middleware.js'; // Prometheus metrics

export async function getMetrics(req, res) {
  try {
    const months = Number(req.query.months) || 12;
    const data = await metricsService.getMetricsData({ months });

    return ok(res, {
      ...data,
      prometheus: await register.metrics()
    });
  } catch (err) {
    console.error('metrics.getMetrics:', err);
    return error(res, err.message || 'Internal server error', 500);
  }
}
