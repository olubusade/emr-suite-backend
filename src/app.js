import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import routes from './modules/index.js';
import { prometheusMiddleware, register } from './shared/middlewares/metrics.middleware.js';
import { errorHandler } from './shared/middlewares/error.middleware.js';
import { setupSwagger } from './config/swagger.js';
import { logger } from './config/logger.js';
import {
  rateLimiter,
  createAccountLimiter,
  authLimiter
} from './shared/middlewares/rateLimit.middleware.js';

import { startBTGExpiryJob } from './jobs/btg-expiry.job.js';

import { randomUUID } from 'crypto';

const app = express();
/**
 * Allows single req.ip in production
 * */
if (process.env.NODE_ENV === 'production') {
  
  app.set('trust proxy', 1);
} else {
  app.set('trust proxy', false);
}

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
    memory: process.memoryUsage(),
    env: process.env.NODE_ENV || 'undefined',
    version: '1.0.0',
    process: {
      id: process.pid,
      platform: process.platform,
      nodeVersion: process.version
    }
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
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] 
}));

app.use(express.json({ limit: '5mb' }));
/**
 * Global payload error
 */

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 'ERROR',
      message: 'Invalid JSON payload',
      details: err.message
    });
  }

  next(err);
});
app.use(express.urlencoded({ extended: true }));

/**
 * 4. TRAFFIC CONTROL (RATE LIMITING)
 * Defensive layer to prevent brute-force attacks and resource exhaustion.
 */
app.use(rateLimiter); // Application-wide default
app.use('/api/auth/register', createAccountLimiter);
app.use('/api/auth/login', authLimiter);

 // Protecting FHIR endpoints with stricter limits due to potential for heavy queries
app.use('/api/fhir', rateLimiter);

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

// =========================
// DOMAIN ROUTING
// =========================
// All business logic is modularized under /api for clarity and maintainability.
app.use((req, res, next) => {
  req.id = randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
});

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

/**
 * 
 * BTG CRON JOBS
 * 
*/
if (process.env.ENABLE_CRON === 'true') {
  startBTGExpiryJob();
}
// Note: The errorHandler middleware will handle all errors thrown in the route handlers and middlewares above it. It should be the last middleware added to the app.
app.use(errorHandler);

export default app;