import { User, Role, Permission } from '../models/index.js';

/**
 * Get all permissions for a user, combining role and direct permissions
 * @param {string|number} userId
 * @returns {Promise<string[]>} Array of unique permission names
 */
export async function getUserPermissions(userId) {
  const user = await User.findByPk(userId, {
    include: {
      model: Role,
      include: { model: Permission, attributes: ['name'] }
    }
  });

  if (!user) return [];

  // Permissions from role
  const rolePermissions = (user.Role?.Permissions || []).map(p => p.name);

  // Permissions directly assigned to user
  const userPermissions = (await user.getPermissions()).map(p => p.name);

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
  return permissions.includes(permissionKey);
}
