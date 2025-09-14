import { v4 as uuidv4 } from 'uuid';

export async function seedPatients(Patient, adminUser) {
  const patients = await Patient.bulkCreate([
    {
      id: uuidv4(),
      firstName: 'Sola',
      lastName: 'Amope',
      dob: '1988-01-01',
      gender: 'male',
      maritalStatus: 'single',
      email: 'sola@busade-emr-demo.com',
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
      createdBy: adminUser.id
    }
  ], { returning: true });

  console.log('Demo patients created');
  return patients;
}
