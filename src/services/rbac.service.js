import { User, Role, Permission } from '../models/index.js';

/**
 * Get all permissions for a user, combining role and direct permissions
 * @param {string|number} userId
 * @returns {Promise<string[]>} Array of unique permission names
 */

export async function getUserPermissions(userId) {
  const user = await User.findByPk(userId, {
    include: [
        {
            model: Role,
            as: 'roles', // MUST use 'roles' alias
            include: [{ 
                model: Permission, 
                as: 'permissions', // MUST use 'permissions' alias
                attributes: ['key','name'] 
            }]
        },
        // We also need to include direct permissions if we plan to use them later
        {
             model: Permission,
             as: 'permissions', // User ↔ Permission alias is 'permissions'
             attributes: ['key','name']
        }
    ]
  });

  if (!user) return [];

  // 1. Permissions from ALL roles
  let rolePermissions = [];
  if (user.roles) {
      rolePermissions = user.roles.flatMap(role =>
          // 🚨 CRITICAL FIX: Map to p.key instead of p.name
          (role.permissions || []).map(p => p.key) 
      );
  }

  // 2. Permissions directly assigned to user
  // 🚨 CRITICAL FIX: Map to p.key instead of p.name
  const userPermissions = (user.permissions || []).map(p => p.key);

  // Combine and remove duplicates
  return Array.from(new Set([...rolePermissions, ...userPermissions]));
}

/**
 * Check if a user has a specific permission
 * @param {string|number} userId
 * @param {string} permissionKey
 * @returns {Promise<boolean>}
 */
export async function userHasPermission(userId, permissionKey) {
  const permissions = await getUserPermissions(userId);
  /* console.log('Permissions:::', permissions);
  console.log('permissionKey:::',permissionKey); */
  return permissions.includes(permissionKey);
}
