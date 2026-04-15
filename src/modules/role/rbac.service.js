import { User, Role, Permission } from '../../config/associations.js';
import { reportError } from '../../shared/utils/monitoring.js';
/**
 * Get all permissions for a user, combining role and direct permissions
 * @param {string|number} userId
 * @returns {Promise<string[]>} Array of unique permission names
 */
/**
 * PERMISSION SERVICE
 * The gatekeeper for Role-Based Access Control (RBAC).
 * Resolves inherited and direct permissions into a flat, unique set of keys.
 */

/**
 * Aggregates all permissions for a user from both their Roles and Direct assignments.
 */
export async function getUserPermissions(userId) {
    try {
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
                //Map to p.key
                (role.permissions || []).map(p => p.key) 
            );
        }
        //2. Extract permissions keys directly assigned to the user
        const userPermissions = (user.permissions || []).map(p => p.key);

        // Combine and remove duplicates
        return Array.from(new Set([...rolePermissions, ...userPermissions]));        
    } catch (err) {
        reportError(err, { service: 'PermissionService', operation: 'getUserPermissions', userId });
        return [];
  }
}

/**
 * Check if a user has a specific permission
 * @param {string|number} userId
 * @param {string} permissionKey
 * @returns {Promise<boolean>}
 */
/**
 * Validates if a user holds a specific authority key.
 * Used primarily by the 'authorize' middleware.
 */
export async function userHasPermission(userId, permissionKey) {
  const permissions = await getUserPermissions(userId);
  return permissions.includes(permissionKey);
}
