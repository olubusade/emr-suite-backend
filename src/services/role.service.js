import { Role, Permission,User,sequelize } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
/**
 * Get role-permission matrix
 */
/* export async function getRoleMatrix() {
  const roles = await Role.findAll({ order: [['name', 'ASC']] });
  const permissions = await Permission.findAll({ order: [['name', 'ASC']] });

  const matrix = await Promise.all(
    roles.map(async (role) => {
      const rolePerms = await role.getPermissions();
      const enabledNames = rolePerms.map(p => p.name);

      return {
        role: role.name,
        permissions: permissions.map(p => ({
          name: p.name,
          enabled: enabledNames.includes(p.name)
        }))
      };
    })
  );

  return {
    roles: roles.map(r => r.name),
    permissions: permissions.map(p => p.name),
    matrix
  };
} */

/**
 * Get all roles (simple list for the sidebar)
 */
export async function getAllRoles() {
    return Role.findAll({
        attributes: ['id', 'name']
    });
}

/**
 * Get all master permissions (simple list for the matrix header)
 */
export async function getAllPermissions() {
    return Permission.findAll({
        attributes: ['id', 'key', 'name']
    });
}

/**
 * Get assigned permissions for a single role
 * @param {number} roleId
 */
export async function getRolePermissions(roleId) {
    const role = await Role.findByPk(roleId, {
        include: [{
            model: Permission,
            as: 'permissions',
            attributes: ['id', 'key', 'name'],
            through: { attributes: [] } // Exclude the join table fields
        }]
    });

    if (!role) {
        throw new ApiError(`Role with ID ${roleId} not found.`, 404);
    }
    // Return an array of simple Permission objects: { id, key, name }
    return role.permissions;
}

/**
 * Update the full set of permissions for a role (The Matrix Save)
 * @param {number} roleId 
 * @param {string[]} permissionKeys - The array of permission KEYS to be assigned
 */
export async function updateRolePermissions(roleId, permissionKeys) {
    const t = await sequelize.transaction();
    try {
        const role = await Role.findByPk(roleId);
        if (!role) {
            throw new ApiError(404, `Role with ID ${roleId} not found.`);
        }

        // 🔑 CHECK 1: Ensure Role ID is valid before proceeding
        if (!role.id) {
            throw new ApiError(500, `Found role instance, but ID is missing.`);
        }
        
        // 1. Find all Permission objects corresponding to the provided keys
        const permissions = await Permission.findAll({
            where: {
                key: permissionKeys
            },
            attributes: ['id']
        }, { transaction: t });

        const permissionIds = permissions.map(p => p.id);
        
        // 🔑 CHECK 2: Debugging the IDs passed to setPermissions
        console.log(`[DEBUG] Role ID: ${role.id}`);
        console.log(`[DEBUG] Permission IDs found for setPermissions:`, permissionIds);

        // 2. Use the Sequelize setPermissions method.
        await role.setPermissions(permissionIds, { transaction: t });

        await t.commit();
        return true;
     } catch (error) {
        await t.rollback();
        
        // 🔑 IMPROVED LOGGING: Log the entire error object if message/original are missing
        console.error(`[CRITICAL DB ERROR - updateRolePermissions]:`);
        console.error(`Error Message: ${error.message}`);
        console.error(`Error Original: ${error.original ? error.original.stack : 'N/A'}`);
        console.error(`Full Error Object:`, error);
        
        // Propagate custom errors (like the 404)
        if (error instanceof ApiError) throw error; 
        
        // Throw a generic 500 error for unexpected database failures
        throw new ApiError(500, 'Failed to update role permissions due to an internal database error. See server logs for details.');
    }
}

// --- Original CRUD Methods ---

export async function createRole(data) {
    const { key, name } = data;
    const existing = await Role.findOne({ where: { key } });
    if (existing) {
        throw new ApiError(`Role key '${key}' already exists.`, 409);
    }
    return Role.create({ key, name });
}

export async function deleteRole(roleId) {
    const result = await Role.destroy({ where: { id: roleId } });
    if (result === 0) {
        throw new ApiError(`Role with ID ${roleId} not found.`, 404);
    }
    return true;
}

export async function createPermission(data) {
    const { key, name } = data;
    const existing = await Permission.findOne({ where: { key } });
    if (existing) {
        throw new HttpError(`Permission key '${key}' already exists.`, 409);
    }
    return Permission.create({ key, name });
}

 /**
 * Retrieves all roles directly assigned to a user.
 * @param {string} userId
 * @returns {Promise<Role[]>}
 */
export async function getUserRoles(userId) {
    // Assuming a many-to-many relationship (UserRole)
    const user = await User.findByPk(userId, {
        include: [{
            model: Role,
            as: 'roles', // Ensure this alias matches your User model definition
            attributes: ['id', 'key', 'name']
        }]
    });
    return user ? user.roles : [];
}

/**
 * Updates/replaces all roles assigned to a user based on role keys.
 * @param {string} userId
 * @param {string[]} roleKeys - Array of role keys to assign.
 * @returns {Promise<void>}
 */
export async function updateUserRoles(userId, roleKeys) {
    const user = await User.findByPk(userId);
    if (!user) {
        throw new ApiError(404,'User not found');
    }

    const roles = await Role.findAll({
        where: { key: { [Op.in]: roleKeys } }
    });

    // Replace existing assignments
    await user.setRoles(roles); // Ensure this method exists on your User model
}
// --- NEW: User Direct Permission Assignment ---

/**
 * Retrieves all direct permissions assigned to a user (used for PBAC override).
 * @param {string} userId
 * @returns {Promise<Permission[]>}
 */
export async function getUserPermissions(userId) {
    const user = await User.findByPk(userId, {
        include: [{
            model: Permission,
            as: 'permissions', // Ensure this alias matches your User model definition
            attributes: ['id', 'key', 'name', 'description']
        }]
    });
    return user ? user.directPermissions : [];
}
/**
 * Updates/replaces all direct permissions assigned to a user based on permission keys.
 * This is used for the permission assignment matrix view.
 * @param {string} userId
 * @param {string[]} permissionKeys - Array of permission keys to assign directly.
 * @returns {Promise<void>}
 */
export async function updateUserPermissions(userId, permissionKeys) {
    const user = await User.findByPk(userId);
    if (!user) {
        throw new ApiError(404,'User not found');
    }

    const permissions = await Permission.findAll({
        where: { key: { [Op.in]: permissionKeys } }
    });

    // Replace existing assignments
    await user.setDirectPermissions(permissions); // Ensure this method exists on your User model
}

/**
 * Attaches a single permission to a user.
 * @param {string} userId
 * @param {string} permissionKey
 * @returns {Promise<void>}
 */
export async function attachPermissionToUser(userId, permissionKey) {
    const user = await User.findByPk(userId);
    const permission = await Permission.findOne({ where: { key: permissionKey } });

    if (!user || !permission) {
      throw new ApiError(404, 'User or Permission not found');
    }

    // Add the new permission without removing others
    await user.addDirectPermission(permission);
}

export async function attachRoleToUser(userId, roleKey) {
    const user = await User.findByPk(userId);
    const role = await Role.findOne({ where: { key: roleKey } });

    if (!user || !role) {
        throw new ApiError(404,'User or Role not found');
    }

    // Add the new role without removing others.
    // Assuming your User model has a method like `addRole`
    await user.addRole(role); 
}