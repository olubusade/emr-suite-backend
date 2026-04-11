// seed/patients.js  (or wherever your seed files live)
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';   // ← prefer bcryptjs (pure JS, no native deps)
import { reportError } from '../utils/monitoring.js';

const DEMO_PASSWORD = 'P@ssword1'; // Never hardcode real passwords — this is demo-only
const SALT_ROUNDS = 10;

async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export async function seedPatients(Patient, adminUser) {
  if (!adminUser?.id) {
    throw new Error('Admin user ID is required for seeding patients');
  }

  const HASHED_PASSWORD = await hashPassword(DEMO_PASSWORD);

  const patientsData = [
    {
      id: uuidv4(),
      firstName: 'Sola',
      lastName: 'Amope',
      middleName: null,           // optional — explicit null is clearer
      dob: '1988-01-01',
      gender: 'male',
      maritalStatus: 'single',
      email: 'sola@busade-emr-demo.com',
      password: HASHED_PASSWORD,
      role: 'patient',
      phone: '08011112222',
      nationalId: null,
      address: 'Amudofin street, Lagos',
      occupation: 'Lawyer',
      nationality: 'Nigeria',
      stateOfOrigin: 'Lagos',
      bloodGroup: 'O+',
      genotype: 'AA',
      emergencyContactName: 'Mr. Amope Senior',
      emergencyContactPhone: '08099998888',
      emergencyRelationship: 'Father',
      profileImage: null,
      status: 'active',
      mustChangePassword: true,   // good UX: force change on first login
      createdBy: adminUser.id,
    },
    {
      id: uuidv4(),
      firstName: 'Dupe',
      lastName: 'Giwa',
      dob: '1995-02-12',
      gender: 'female',
      maritalStatus: 'married',
      email: 'dupe@busade-emr-demo.com',
      password: HASHED_PASSWORD,
      role: 'patient',
      phone: '07033334444',
      nationalId: null,
      address: 'Amudofin street, Lagos',
      occupation: 'Entertainer',
      bloodGroup: 'A-',
      genotype: 'AS',
      nationality: 'Nigeria',
      stateOfOrigin: 'Ogun',
      emergencyContactName: 'Mrs. Giwa',
      emergencyContactPhone: '08122223333',
      emergencyRelationship: 'Mother',
      status: 'active',
      mustChangePassword: true,
      createdBy: adminUser.id,
    },
    {
      id: uuidv4(),
      firstName: 'Alice',
      lastName: 'Johnson',
      dob: '1981-07-20',
      gender: 'female',
      maritalStatus: 'single',
      email: 'alice@busade-emr-demo.com',
      password: HASHED_PASSWORD,
      role: 'patient',
      phone: '09055556666',
      nationalId: null,
      address: 'Amudofin street, Lagos',
      occupation: 'Musician',
      bloodGroup: 'B+',
      genotype: 'SS',
      nationality: 'Nigeria',
      stateOfOrigin: 'Ondo',
      status: 'active',
      mustChangePassword: true,
      createdBy: adminUser.id,
    },
    // Optional: Add yourself / demo admin as a patient too (useful for portal testing)
    {
      id: uuidv4(),
      firstName: 'Olubusade',
      lastName: 'Adedayo',
      dob: '2002-02-05',
      gender: 'male',
      maritalStatus: 'single',
      email: 'busade@crovix.tech',  // or your preferred demo email
      password: HASHED_PASSWORD,
      role: 'patient',
      phone: '08023232323',
      nationalId: null,
      address: 'Lekki, Lagos',
      occupation: 'Senior Software Engineer',
      bloodGroup: 'B+',
      genotype: 'SS',
      nationality: 'Nigeria',
      stateOfOrigin: 'Lagos',
      status: 'active',
      mustChangePassword: true,
      createdBy: adminUser.id,
    },
  ];

 try {
    process.stdout.write('⏳ Synchronizing patient registry... ');

    // Idempotency check: Skip if emails already exist
    const existingEmails = await Patient.findAll({
      where: { email: patientsData.map(p => p.email) },
      attributes: ['email'],
      raw: true,
    });

    const existingEmailSet = new Set(existingEmails.map(e => e.email));
    const newPatients = patientsData.filter(p => !existingEmailSet.has(p.email));

    if (newPatients.length === 0) {
      process.stdout.write('ℹ️  Registry up to date.\n');
      return await Patient.findAll({ where: { email: patientsData.map(p => p.email) } });
    }

    const created = await Patient.bulkCreate(newPatients, {
      returning: true,
      individualHooks: true, 
    });

    process.stdout.write(`Success (${created.length} new patients registered)\n`);
    return created;

  } catch (error) {
    process.stdout.write('❌ Failed\n');
    
    reportError(error, { 
      service: 'Seeder', 
      operation: 'seedPatients',
      context: 'Onboarding demo medical records' 
    });

    throw error;
  }
}