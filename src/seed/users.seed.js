import { reportError } from '../shared/utils/monitoring.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

/**
 * SEED USERS
 * Populates core staff accounts for demo/testing
 */
export async function seedUsers(User) {
  const usersToSeed = [
    {
      key: 'super_admin',
      fName: 'System',
      lName: 'Admin',
      email: 'systemadmin@busade-emr-demo.com',
      pass: 'superadmin@123',
      designation: 'System Administrator'
    },
    {
      key: 'admin',
      fName: 'Hospital',
      lName: 'Admin',
      email: 'hospitaladmin@busade-emr-demo.com',
      pass: 'admin@123',
      designation: 'Hospital Administrator'
    },
    {
      key: 'doctor',
      fName: 'John',
      lName: 'Doe',
      email: 'physician@busade-emr-demo.com',
      pass: 'doctor@123',
      designation: 'Consultant Physician'
    },
    {
      key: 'nurse',
      fName: 'Mary',
      lName: 'Smith',
      email: 'nurse@busade-emr-demo.com',
      pass: 'nurse@123',
      designation: 'Registered Nurse'
    },
    {
      key: 'receptionist',
      fName: 'Jane',
      lName: 'Williams',
      email: 'frontdesk@busade-emr-demo.com',
      pass: 'reception@123',
      designation: 'Front Desk Officer'
    },
    {
      key: 'patient',
      fName: 'Paul',
      lName: 'Martins',
      email: 'patient@busade-emr-demo.com',
      pass: 'patient@123',
      designation: 'Patient'
    }
  ];

  const users = {};

  try {
    process.stdout.write(
      `⏳ Provisioning ${usersToSeed.length} core staff accounts... `
    );

    for (const u of usersToSeed) {
      const hashedPassword = await bcrypt.hash(u.pass, 10);

      const [userRecord] = await User.findOrCreate({
        where: { email: u.email },
        defaults: {
          id: uuidv4(),
          fName: u.fName,
          lName: u.lName,
          fullName: `${u.fName} ${u.lName}`,
          email: u.email,
          passwordHash: hashedPassword,
          designation: u.designation, // ✅ ADDED HERE
          active: true
        }
      });

      users[u.key] = userRecord;
    }

    process.stdout.write('Success (Personnel accounts active)\n');
    return users;

  } catch (error) {
    process.stdout.write('❌ Failed\n');

    reportError(error, {
      service: 'Seeder',
      operation: 'seedUsers',
      context: 'Initializing core system and demo personnel'
    });

    throw error;
  }
}