import { reportError } from '../shared/utils/monitoring.js';
export async function seedRoles(Role) {
  try {
      const roleNames = [
      'super_admin',
      'admin',
      'doctor',
      'nurse',
      'receptionist',
      'patient'
    ];
  
    const roles = {};
    for (const name of roleNames) {
      const role = await Role.create({ name });
      roles[name] = role;
    }
  
    process.stdout.write('✅ Success (Staff categories established)\n');
    return roles;
  } catch (error) {
    process.stdout.write('❌ Failed\n');
    
    reportError(error, { 
      service: 'Seeder', 
      operation: 'seedRoles',
      context: 'Initializing RBAC authority keys'
    });

    throw error;
  }
    
  }
  
