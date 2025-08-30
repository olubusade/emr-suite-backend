import express from 'express';
import authRoutes from './auth.routes.js';
import rolesRoutes from './roles.routes.js';
import patientsRoutes from './patients.routes.js';
import billsRoutes from './bills.routes.js';
import metricsRoutes from './metrics.routes.js';
import auditRoutes from './audit.routes.js';
import appointmentRoutes from './appointment.routes.js';
import userRoutes from './user.routes.js';

const router = express.Router();

// -------------------- Auth -------------------- //
router.use('/auth', authRoutes);

// -------------------- Roles -------------------- //
router.use('/roles', rolesRoutes);

// -------------------- Patients -------------------- //
router.use('/patients', patientsRoutes);

// -------------------- Bills -------------------- //
router.use('/bills', billsRoutes);

// -------------------- Metrics -------------------- //
router.use('/metrics', metricsRoutes);

// -------------------- Audit -------------------- //
router.use('/audit', auditRoutes);

// -------------------- Appointments -------------------- //
router.use('/appointments', appointmentRoutes);

// -------------------- Users -------------------- //
router.use('/users', userRoutes);

export default router;
