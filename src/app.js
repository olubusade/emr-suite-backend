import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import routes from './routes/index.js';
import { prometheusMiddleware, register } from './middlewares/metrics.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { setupSwagger } from './config/swagger.js';
import {
  rateLimiter,
  createAccountLimiter,
  authLimiter
} from './middlewares/rateLimit.middleware.js';

const app = express();

/* -------------------------
   Security & Parsing
------------------------- */
app.use(helmet());
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

/* -------------------------
   Logging
------------------------- */
app.use(morgan('tiny'));

/* -------------------------
   Rate limiting
------------------------- */
// Global rate limit for all routes
app.use(rateLimiter);

// Specific limits for sensitive endpoints
app.use('/api/auth/register', createAccountLimiter);
app.use('/api/auth/login', authLimiter);

// Resource-specific additional protection
['/api/bills', '/api/appointments', '/api/patients', '/api/users', '/api/clinical-notes','/api/vitals'].forEach(
  (path) => app.use(path, rateLimiter)
);

/* -------------------------
   Prometheus metrics
------------------------- */
app.use(prometheusMiddleware);

/* -------------------------
   API Routes
------------------------- */
app.use('/api', routes);

/* -------------------------
   Swagger docs
------------------------- */
setupSwagger(app);

/* -------------------------
   /metrics endpoint for Prometheus
------------------------- */
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

/* -------------------------
   Health check endpoint
------------------------- */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now() });
});

/* -------------------------
   Global Error Handler
------------------------- */
app.use(errorHandler);

export default app;
