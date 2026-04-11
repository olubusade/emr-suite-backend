import * as metricsService from '../services/metrics.service.js';
import { ok, error } from '../utils/response.js';
import { register } from '../middlewares/metrics.middleware.js';

/**
 * Get metrics data
 * GET /api/metrics
 */
export async function getMetrics(req, res) {
  try {
    const months = parseInt(req.query.months, 10) || 12;
    const data = await metricsService.getMetricsData({ months });
    const prometheusMetrics = await register.metrics();

    const { totals, monthlyPatientTrend, clinical, nurse } = data;

    // Base response for all roles
    const response = {
      patientCount: totals.patients,
      userCount: totals.users,
      totalAppointments: totals.appointments,
      revenue: totals.revenuePaid,
      revenuePending: totals.revenuePending,
      monthlyPatientTrend: monthlyPatientTrend,
      prometheusMetrics: prometheusMetrics,
    };

    // 🏥 Doctor-Specific Slice (clinical)
    response.clinical = {
      widgets: {
        todayPatients: clinical.todaysAppointments.length,
        readyForDoctor: nurse.widgets.readyForDoctor,
        completedConsultation:clinical.completedConsultation,
        todaysOperations: clinical.todaysOperations || 0,
        onlineConsultations: clinical.onlineConsultations || 0,
        growthRates: { patients: 12, appointments: 8, operations: 0, online: 0 }
      },
      charts: {
        patientSurvey: {
          // Mapping real trend data to charts if available, else empty arrays
          newPatients: monthlyPatientTrend.map(m => m.newCount || 0),
          recovered: monthlyPatientTrend.map(m => m.recoveredCount || 0),
          labels: monthlyPatientTrend.map(m => m.month)
        },
        appointmentReview: {
          series: [
            clinical.todaysAppointments.filter(a => a.type === 'Face-to-Face').length,
            clinical.todaysAppointments.filter(a => a.type === 'E-Consult').length,
            10 // Available slots (could be dynamic)
          ],
          labels: ["Face to Face", "E-Consult", "Available"]
        }
      },
      todaysAppointments: mapAppointments(clinical.todaysAppointments),
      patientGroups: clinical.patientGroups
    };

    // 👩‍⚕️ Nurse-Specific Slice
    response.nurse = {
      widgets: {
        todayPatients: clinical.todaysAppointments.length,
        readyForDoctor: nurse.widgets.readyForDoctor,
        pendingVitals: nurse?.pendingVitalsCount || 0,
        growthRates: { patients: 15, appointments: 10 }
      },
      // Real Doctors list from database
      doctors: (nurse?.doctors || []).map(doc => ({
        name: `Dr. ${doc.fName} ${doc.lName}`,
        specialization: doc.specialization || 'General Practitioner',
        status: doc.status || 'available',
        profileImage: doc.profileImage || 'assets/images/user/user1.jpg'
      })),
      todaysAppointments: mapAppointments(clinical.todaysAppointments),
      patientGroups: clinical.patientGroups
    };

    return ok(res, response);
  } catch (err) {
    console.error('metrics.getMetrics Error:', err);
    return error(res, 500, err.message || 'Internal server error');
  }
}

/**
 * Helper to map appointment data consistently for both views
 */
function mapAppointments(appointments) {
  return (appointments || []).map(appt => {
    const displayReason = appt.reason || (appt.notes ? appt.notes.substring(0, 20) + '...' : 'General Visit');
    return {
      patientId: appt.patientId,
      patient: appt.patient,
      chiefComplaint: displayReason,
      tagClass: getMedicalTag(displayReason),
      updatedAt: appt.updatedAt,
      gender: appt.patient?.gender || 'N/A'
    };
  });
}

/**
 * Logic to style the UI badges based on the 'reason'
 */
function getMedicalTag(reason) {
  const r = reason?.toLowerCase() || '';
  if (r.includes('fever') || r.includes('emergency')) return 'col-red';
  if (r.includes('checkup') || r.includes('routine')) return 'col-green';
  if (r.includes('surgery') || r.includes('operation')) return 'col-purple';
  if (r.includes('cholera') || r.includes('malaria')) return 'col-orange';
  return 'col-blue';
}