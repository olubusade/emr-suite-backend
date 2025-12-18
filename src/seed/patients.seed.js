import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

const HASHED_PASSWORD = bcrypt.hashSync('P@ssword1', 10); // Use a standard demo password

export async function seedPatients(Patient, adminUser) {
  const patientsData = [
    {
      id: uuidv4(),
      firstName: 'Sola',
      lastName: 'Amope',
      dob: '1988-01-01',
      gender: 'male',
      maritalStatus: 'single',
      email: 'sola@busade-emr-demo.com',
      password: HASHED_PASSWORD, // 🔑 CRITICAL: Added password
      role: 'patient',
      phone: '08011112222',
      bloodGroup: 'O+',
      genotype: 'AA',
      createdBy: adminUser.id
    },
    {
      id: uuidv4(),
      firstName: 'Dupe',
      lastName: 'Giwa',
      dob: '1995-02-12',
      gender: 'female',
      maritalStatus: 'married',
      email: 'dupe@busade-emr-demo.com',
      password: HASHED_PASSWORD, // 🔑 CRITICAL: Added password
      role: 'patient',
      phone: '07033334444',
      bloodGroup: 'A-',
      genotype: 'AS',
      createdBy: adminUser.id
    },
    {
      id: uuidv4(),
      firstName: 'Alice',
      lastName: 'Johnson',
      dob: '1981-07-20',
      gender: 'female',
      maritalStatus: 'single',
      email: 'alice@busade-emr-demo.com',
      password: HASHED_PASSWORD, // 🔑 CRITICAL: Added password
      role: 'patient',
      phone: '09055556666',
      bloodGroup: 'B+',
      genotype: 'SS',
      createdBy: adminUser.id
    }
  ];
  
  // NOTE: You must ensure 'bcrypt' is available in your seed environment.
  const patients = await Patient.bulkCreate(patientsData, { returning: true });

  console.log('✅ Demo patients created');
  return patients;
}