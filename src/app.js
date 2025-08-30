// src/app.js
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import { prometheusMiddleware, register } from './middlewares/metrics.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { mountSwagger } from './config/swagger.js';
import rateLimiter from './middlewares/rateLimit.middleware.js';

const app = express();

// Security & parsing
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('tiny'));

// Rate limit (global)
app.use(rateLimiter);

// Metrics (per-request)
app.use(prometheusMiddleware);

// API routes
app.use('/api', routes);

// Swagger UI
mountSwagger(app);

// /metrics endpoint for Prometheus
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Global error formatter (keeps your ok/created/fail/error shape)
app.use(errorHandler);

export default app;
