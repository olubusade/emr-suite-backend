import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export async function seedUsers(User, roles) {
  const adminPassword = await bcrypt.hash('admin@123', 10);

  const adminUser = await User.create({
    id: uuidv4(),
    fname: 'Admin',
    lname: 'User',
    full_name: 'Admin User',
    email: 'admin@busade-emr-demo.com',
    password_hash: adminPassword,
    role_id: roles.admin.id,
    active: true
  });

  console.log(`Admin user created (email: ${adminUser.email} | password: admin@123)`);

  // You can also pre-create some doctors if needed
  const doctorUser = await User.create({
    id: uuidv4(),
    fname: 'John',
    lname: 'Doe',
    full_name: 'John Doe',
    email: 'john.doe@busade-emr-demo.com',
    password_hash: await bcrypt.hash('doctor123', 10),
    role_id: roles.doctor.id,
    active: true
  });

  return { adminUser, doctorUser };
}
