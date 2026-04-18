import { Role, Permission,User,sequelize } from '../../config/associations.js';
import ApiError from '../../shared/utils/ApiError.js';
import { reportError, logSecurityAlert } from '../../shared/utils/monitoring.js';
/**
 * RBAC SERVICE
 * Manages the Role-Based Access Control matrix.
 * Handles the assignment of permissions to roles and roles to users.
 */

/* -------------------------------------------------------------------------- */
/* Roles & Permissions Discovery                */
/* -------------------------------------------------------------------------- */
export async function getAllRoles() {
    return Role.findAll({
        attributes: ['id', 'name'],
        order: [['name', 'ASC']]
    });
}

/**
 * Get all master permissions (simple list for the matrix header)
 */
export async function getAllPermissions() {
    return Permission.findAll({
        attributes: ['id', 'key', 'name'],
        order: [['key', 'ASC']]
    });
}

/**
 * Get assigned permissions for a single role
 * @param {number} roleId
 */
/**
 * Retrieves the full permission set for a specific role.
 */
export async function getRolePermissions(roleId) {
    try {
        const role = await Role.findByPk(roleId, {
            include: [{
                model: Permission,
                as: 'permissions',
                attributes: ['id', 'key', 'name'],
                through: { attributes: [] } // Exclude the join table fields
            }]
        });

        if (!role) {
            throw new ApiError(404,`Role with ID ${roleId} not found.`);
        }
        // Return an array of simple Permission objects: { id, key, name }
        return role.permissions;
    } catch (err) {
        reportError(err, { service: 'RBAC', operation: 'getRolePermissions', roleId });
        throw err;
    }
    
}

/* -------------------------------------------------------------------------- */
/* Matrix Management (Updates)                  */
/* -------------------------------------------------------------------------- */

/**
 * Syncs a role with a new set of permission keys.
 * This is the primary engine for the "Admin Matrix" UI.
 */
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

        //Ensure Role ID is valid before proceeding
        if (!role.id) {
            throw new ApiError(500, `Found role instance, but ID is missing.`);
        }
        
        //Find all Permission objects corresponding to the provided keys
        const permissions = await Permission.findAll({
            where: {
                key: permissionKeys
            },
            attributes: ['id']
        }, { transaction: t });

        const permissionIds = permissions.map(p => p.id);

        //REPLACEMENT LOGIC: Overwrites existing permissions for this role
        await role.setPermissions(permissionIds, { transaction: t });

        await t.commit();
        logSecurityAlert('Role Permissions Updated', { roleId, keys: permissionKeys });
        return true;
     } catch (err) {
        await transaction.rollback();
        reportError(err, { service: 'RBAC', operation: 'updateRolePermissions' });
        throw err;
    }
}

/* -------------------------------------------------------------------------- */
/* CRUD Operations                              */
/* -------------------------------------------------------------------------- */

export async function createRole(data) {
    const { key, name } = data;
    const existing = await Role.findOne({ where: { key } });
    if (existing) {
        throw new ApiError(409, `Role key '${key}' already exists.`);
    }
    return Role.create({ key, name });
}

export async function deleteRole(roleId) {
    const result = await Role.destroy({ where: { id: roleId } });
    if (result === 0) {
        throw new ApiError(404, `Role with ID ${roleId} not found.`);
    }
    return true;
}

export async function createPermission(data) {
    const { key, name } = data;
    const existing = await Permission.findOne({ where: { key } });
    if (existing) {
        throw new HttpError(409, `Permission key '${key}' already exists.`);
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
 * Assigns or replaces the roles assigned to a user.
 */

/**
 * Updates/replaces all roles assigned to a user based on role keys.
 * @param {string} userId
 * @param {string[]} roleKeys - Array of role keys to assign.
 * @returns {Promise<void>}
 */
export async function updateUserRoles(userId, roleKeys) {
  const transaction = await sequelize.transaction();
  try {
    const user = await User.findByPk(userId, { transaction });
    if (!user) throw new ApiError(404, 'User not found');

    const roles = await Role.findAll({
      where: { key: { [Op.in]: roleKeys } },
      transaction
    });

    // 🛡️ REPLACEMENT LOGIC: Syncs user roles to the provided set
    await user.setRoles(roles, { transaction });

    await transaction.commit();
    return true;
  } catch (err) {
    await transaction.rollback();
    reportError(err, { service: 'RBAC', operation: 'updateUserRoles', userId });
    throw err;
  }
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
 * PBAC (Policy Based Access Control) Override:
 * Assigns permissions directly to a user, bypassing their roles.
 */
/**
 * Updates/replaces all direct permissions assigned to a user based on permission keys.
 * This is used for the permission assignment matrix view.
 * @param {string} userId
 * @param {string[]} permissionKeys - Array of permission keys to assign directly.
 * @returns {Promise<void>}
 */
export async function updateUserPermissions(userId, permissionKeys) {
  const transaction = await sequelize.transaction();
  try {
    const user = await User.findByPk(userId, { transaction });
    if (!user) throw new ApiError(404, 'User not found');

    const permissions = await Permission.findAll({
      where: { key: { [Op.in]: permissionKeys } },
      transaction
    });

    // This uses the 'permissions' alias directly on the User model
    const updatedPermissions = await user.setPermissions(permissions, { transaction });

    await transaction.commit();
    return updatedPermissions;
  } catch (err) {
    await transaction.rollback();
    reportError(err, { service: 'RBAC', operation: 'updateUserPermissions', userId });
    throw err;
  }
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