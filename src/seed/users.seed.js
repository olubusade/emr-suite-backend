import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export async function seedUsers(User) {
  const users = {};

  users.admin = await User.create({
    id: uuidv4(),
    fName: 'Admin',
    lName: 'User',
    fullName: 'Admin User',
    email: 'admin@busade-emr-demo.com',
    passwordHash: await bcrypt.hash('admin@123', 10),
    active: true
  });

  users.doctor = await User.create({
    id: uuidv4(),
    fName: 'John',
    lName: 'Doe',
    fullName: 'John Doctor',
    email: 'john.doctor@busade-emr-demo.com',
    passwordHash: await bcrypt.hash('doctor@123', 10),
    active: true
  });

  users.nurse = await User.create({
    id: uuidv4(),
    fName: 'Mary',
    lName: 'Smith',
    fullName: 'Mary Nurse',
    email: 'mary.nurse@busade-emr-demo.com',
    passwordHash: await bcrypt.hash('nurse@123', 10),
    active: true
  });

  users.receptionist = await User.create({
    id: uuidv4(),
    fName: 'Jane',
    lName: 'Reception',
    fullName: 'Jane Reception',
    email: 'jane.reception@busade-emr-demo.com',
    passwordHash: await bcrypt.hash('reception@123', 10),
    active: true
  });

  users.patient = await User.create({
    id: uuidv4(),
    fName: 'Paul',
    lName: 'Patient',
    fullName: 'Paul Patient',
    email: 'paul.patient@busade-emr-demo.com',
    passwordHash: await bcrypt.hash('patient@123', 10),
    active: true
  });

  console.log('Users seeded');
  return users;
}
