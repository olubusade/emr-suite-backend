import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import routes from './routes/index.js';
import { prometheusMiddleware, register } from './middlewares/metrics.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { setupSwagger } from './config/swagger.js';
import { rateLimiter, createAccountLimiter, authLimiter } from './middlewares/rateLimit.middleware.js';

const app = express();

// -------------------------
// Security & Parsing
// -------------------------
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// -------------------------
// Logging
// -------------------------
app.use(morgan('tiny'));

// -------------------------
// Rate limiting
// -------------------------

// Global rate limit for all routes
app.use(rateLimiter);

// Specific limits for sensitive endpoints
app.use('/api/auth/register', createAccountLimiter);
app.use('/api/auth/login', authLimiter);

// You can also apply custom limits per module if needed
// Example: billing and appointments (sensitive endpoints)
app.use('/api/bills', rateLimiter);
app.use('/api/appointments', rateLimiter);
app.use('/api/patients', rateLimiter);
app.use('/api/users', rateLimiter);

// -------------------------
// Prometheus metrics
// -------------------------
app.use(prometheusMiddleware);

// -------------------------
// API Routes
// -------------------------
app.use('/api', routes);

// -------------------------
// Swagger docs
// -------------------------
setupSwagger(app);

// -------------------------
// /metrics endpoint for Prometheus
// -------------------------
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// -------------------------
// Global Error Handler
// -------------------------
app.use(errorHandler);

export default app;
