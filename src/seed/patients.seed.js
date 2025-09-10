import { v4 as uuidv4 } from 'uuid';

export async function seedPatients(Patient, adminUser) {
  const patients = await Patient.bulkCreate([
    {
      id: uuidv4(),
      first_name: 'Sola',
      last_name: 'Amope',
      dob: '1988-01-01',
      gender: 'male',
      marital_status: 'single',
      email: 'sola@busade-emr-demo.com',
      created_by: adminUser.id
    },
    {
      id: uuidv4(),
      first_name: 'Dupe',
      last_name: 'Giwa',
      dob: '1995-02-12',
      gender: 'female',
      marital_status: 'married',
      email: 'dupe@busade-emr-demo.com',
      created_by: adminUser.id
    },
    {
      id: uuidv4(),
      first_name: 'Alice',
      last_name: 'Johnson',
      dob: '1981-07-20',
      gender: 'female',
      marital_status: 'single',
      email: 'alice@busade-emr-demo.com',
      created_by: adminUser.id
    }
  ], { returning: true });

  console.log('Demo patients created');
  return patients;
}
