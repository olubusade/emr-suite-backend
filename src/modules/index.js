import express from 'express';
import authRoutes from './auth/auth.routes.js';
import rolesRoutes from './role/roles.routes.js';
import patientsRoutes from './patient/patients.routes.js';
import billsRoutes from './bill/bills.routes.js';
import metricsRoutes from './metrics/metrics.routes.js';
import auditRoutes from './audit/audit.routes.js';
import appointmentRoutes from './appointment/appointment.routes.js';
import userRoutes from './user/user.routes.js';
import clinicalRoutes from './clinical/clinical.routes.js';
import vitalsRoutes from './vitals/vitals.routes.js';
import btgRoutes from './btg/btg.routes.js';
import btgSessionRoutes from './btg/btg-session/btg-session.routes.js';
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

// -------------------- Clinical Notes -------------------- //
router.use('/clinical', clinicalRoutes);

// -------------------- Vitals -------------------- //
router.use('/vitals', vitalsRoutes);

// -------------------- Users -------------------- //
router.use('/users', userRoutes);

// -------------------- Break-The-Glass -------------------- //
router.use('/btg', btgRoutes);

// -------------------- Break-The-Glass-session -------------------- //
router.use('/btg-session', btgSessionRoutes);

// -------------------- FHIR Export -------------------- //
// (Could be its own module if it grows, but for now it's just one endpoint in the patient module)


export default router;
