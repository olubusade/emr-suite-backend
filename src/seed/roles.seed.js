export async function seedRoles(Role) {
    const roleNames = [
      'super_admin',
      'admin',
      'doctor',
      'nurse',
      'receptionist',
      'biller',
      'lab_technician',
      'pharmacist'
    ];
  
    const roles = {};
    for (const name of roleNames) {
      const role = await Role.create({ name });
      roles[name] = role;
    }
  
    console.log('✅ Roles seeded');
    return roles;
  }
  
