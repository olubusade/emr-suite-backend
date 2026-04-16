import { reportError } from '../shared/utils/monitoring.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

/**
 * SEED USERS
 * Populates the core staff and demo accounts.
 * Uses findOrCreate to ensure idempotency across multiple seed runs.
 */
export async function seedUsers(User) {
  const usersToSeed = [
    { key: 'super_admin', fName: 'Super', lName: 'Admin', email: 'superadmin@busade-emr-demo.com', pass: 'superadmin@123' },
    { key: 'admin', fName: 'Admin', lName: 'User', email: 'admin@busade-emr-demo.com', pass: 'admin@123' },
    { key: 'doctor', fName: 'John', lName: 'Doe', email: 'doctor@busade-emr-demo.com', pass: 'doctor@123' },
    { key: 'nurse', fName: 'Mary', lName: 'Smith', email: 'nurse@busade-emr-demo.com', pass: 'nurse@123' },
    { key: 'receptionist', fName: 'Jane', lName: 'Williams', email: 'reception@busade-emr-demo.com', pass: 'reception@123' },
    { key: 'patient', fName: 'Paul', lName: 'Martins', email: 'patient@busade-emr-demo.com', pass: 'patient@123' }
  ];

  const users = {};

  try {
    process.stdout.write(`⏳ Provisioning ${usersToSeed.length} core staff accounts... `);

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