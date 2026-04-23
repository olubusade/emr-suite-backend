import { reportError } from '../shared/utils/monitoring.js';

/**
 * SEED BREAK-THE-GLASS (BTG) REQUESTS
 * Creates demo emergency access scenarios for testing & recruiter demo.
 */
export async function seedBTGRequests(BTGRequest, users, patients) {
  try {
    process.stdout.write('⏳ Seeding BTG requests... ');

    // 👥 Extract key actors
    const nurse = users.nurse;
    const admin = users.admin;
    const patientList = Object.values(patients);

    if (!nurse || !admin || patientList.length === 0) {
      process.stdout.write('Skipped (Missing dependencies)\n');
      return;
    }

    const now = new Date();

    // 🧠 Create realistic scenarios
    const records = [
      {
        patientId: patientList[0].id,
        requestedBy: nurse.id,
        approvedBy: admin.id,
        status: 'APPROVED',
        reason: 'Emergency: Patient unconscious, immediate access required',
        expiresAt: new Date(now.getTime() + 60 * 60 * 1000), // 1 hour
        createdAt: now,
        updatedAt: now
      },
      {
        patientId: patientList[1]?.id || patientList[0].id,
        requestedBy: nurse.id,
        status: 'PENDING',
        reason: 'Urgent review needed for critical vitals',
        expiresAt: new Date(now.getTime() + 30 * 60 * 1000), // 30 mins
        createdAt: now,
        updatedAt: now
      },
      {
        patientId: patientList[2]?.id || patientList[0].id,
        requestedBy: nurse.id,
        approvedBy: admin.id,
        status: 'APPROVED',
        reason: 'Night shift emergency access granted',
        expiresAt: new Date(now.getTime() - 10 * 60 * 1000), // ❌ expired
        createdAt: now,
        updatedAt: now
      }
    ];

    await BTGRequest.bulkCreate(records);

    process.stdout.write('Success (BTG requests seeded)\n');
  } catch (error) {
    process.stdout.write('❌ Failed\n');

    reportError(error, {
      service: 'Seeder',
      operation: 'seedBTGRequests',
      context: 'Creating BTG emergency access records'
    });

    throw error;
  }
}