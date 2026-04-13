import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import routes from './routes/index.js';
import { prometheusMiddleware, register } from './middlewares/metrics.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { setupSwagger } from './config/swagger.js';
import { logger } from './config/logger.js';
import {
  rateLimiter,
  createAccountLimiter,
  authLimiter
} from './middlewares/rateLimit.middleware.js';

const app = express();

/**
 * 1. CLOUD-READY HEALTH CHECK
 * Placed at the very top to bypass logging/auth overhead.
 * Vital for Docker/Kubernetes liveness probes.
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

/**
 * 2. OBSERVABILITY LAYER
 * We initialize metrics and logging early to capture 
 * the full lifecycle of every incoming request.
 */
app.use(prometheusMiddleware);

// Integrating Morgan with Winston to centralize all HTTP traffic logs
app.use(morgan('combined', { 
  stream: { write: (message) => logger.info(message.trim()) } 
}));

/**
 * 3. SECURITY & PAYLOAD PARSING
 * Standardizing headers and limiting payload size to prevent DOS attacks.
 */
app.use(helmet());
app.use(cors({ 
  origin: '*', // Adjust this for production to specific domains
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] 
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

/**
 * 4. TRAFFIC CONTROL (RATE LIMITING)
 * Defensive layer to prevent brute-force attacks and resource exhaustion.
 */
app.use(rateLimiter); // Application-wide default
app.use('/api/auth/register', createAccountLimiter);
app.use('/api/auth/login', authLimiter);

// Strict protection for core EMR domain resources
const protectedResources = [
  '/api/bills', 
  '/api/appointments', 
  '/api/patients', 
  '/api/users', 
  '/api/clinical-notes',
  '/api/vitals'
];
protectedResources.forEach(path => app.use(path, rateLimiter));

/**
 * 5. EXTERNAL DOCUMENTATION & MONITORING
 * Exposing Swagger UI and Prometheus scrape endpoints.
 */
setupSwagger(app);


app.get('/metrics', async (_req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    logger.error('Metrics collection failed', { error: err.message });
    res.status(500).end(err);
  }
});

/**
 * 6. DOMAIN ROUTING
 * All modularized business logic is prefix-grouped under /api
 */
app.use('/api', routes);

/**
 * 7. GLOBAL ERROR HANDLING (THE SAFETY NET)
 * Must remain the final middleware to catch all upstream 'next(err)' calls.
 * This keeps the controller logic clean of try-catch blocks where possible.
 */
app.use(errorHandler);

export default app;