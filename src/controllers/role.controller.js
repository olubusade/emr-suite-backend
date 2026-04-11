import * as roleService from '../services/role.service.js';
import { ok, created, noContent, fail, error } from '../utils/response.js'; // Added noContent
import { attachAudit } from '../middlewares/audit.middleware.js';

/**
 * ROLE & PERMISSION CONTROLLER
 * Manages the global security matrix including Roles, Permissions, 
 * and their associations to Users.
 */

// --- GLOBAL LOOKUPS ---
export async function getAllRoles(req, res) {
  try {
    const roles = await roleService.getAllRoles();
    // Assuming roleService.getAllRoles returns an array of { id, name, key }
    return ok(res, roles, 'All roles retrieved successfully');
  } catch (err) {
    return error(res, 500, err.message || 'Unable to fetch roles');
  }
}

/**
 * Get all master permissions (simple list)
 */
export async function getAllPermissions(req, res) {
    try {
        const permissions = await roleService.getAllPermissions();
        // Assuming roleService.getAllPermissions returns an array of { id, key, name }
        return ok(res, permissions, 'Master permissions retrieved successfully');
    } catch (err) {
        return error(res, 500, err.message || 'Unable to fetch master permissions');
    }
}


// --- Role-Permission Assignment Methods ---

/**
 * Get permissions assigned to a specific role
 */
export async function getRolePermissions(req, res) {
    try {
        const { roleId } = req.params;
        const permissions = await roleService.getRolePermissions(roleId);

        // Assuming roleService.getRolePermissions returns an array of { id, key, name }
        return ok(res, permissions, `Permissions for role ${roleId} retrieved successfully`);
    } catch (err) {
        if (err.statusCode === 404) return fail(res, err.message, 404);
        return error(res, 500, err.message || 'Unable to fetch role permissions');
    }
}

/**
 * Update permissions for a specific role (The Matrix Save button)
 */
export async function updateRolePermissions(req, res) {
    try {
        const { roleId } = req.params;
        const { permissionKeys } = req.body; // Array of keys, e.g., ['PATIENT_READ', 'USER_CREATE']

        await roleService.updateRolePermissions(roleId, permissionKeys);
        
        await attachAudit(req, { 
            action: 'RBAC_ROLE_PERMISSIONS_UPDATE', 
            entity: 'role', 
            entityId: roleId, 
            metadata: { query: permissionKeys } 
        });
        return ok(res, null, `Permissions for role ${roleId} updated successfully`);
    } catch (err) {
        if (err.statusCode === 404) return fail(res, err.message, 404);
        return error(res, 500, err.message || 'Unable to update role permissions');
    }
}

// --- ROLE & PERMISSION CRUD ---

/**
 * Create a new role (Updated endpoint to use base path)
 */
export async function createRole(req, res) {
  try {
    const role = await roleService.createRole(req.body);
      
      await attachAudit(req, { 
            action: 'RBAC_ROLE_CREATE', 
            entity: 'role', 
            entityId: role.id, 
            metadata: { query: req.body } 
        });

    return created(res, {
      id: role.id,
      name: role.name,
      key: role.key, // Ensure key is returned
    }, 'Role created successfully');
  } catch (err) {
    if (err.statusCode === 409) return fail(res, err.message, 409);
    return error(res, 500, err.message || 'Unable to create role');
  }
}

/**
 * Delete a role
 */
export async function deleteRole(req, res) {
    try {
        const { roleId } = req.params;
        await roleService.deleteRole(roleId);
        
        await attachAudit(req, { 
            action: 'RBAC_ROLE_DELETE', 
            entity: 'role', 
            entityId: roleId, 
            metadata: { query: req.params } 
        });

        return noContent(res); // 204 No Content for successful deletion
    } catch (err) {
        if (err.statusCode === 404) return fail(res, err.message, 404);
        return error(res, 500, err.message || 'Unable to delete role');
    }
}


// --- Permission CRUD Methods ---

/**
 * Create a new permission
 */
export async function createPermission(req, res) {
  try {
    const permission = await roleService.createPermission(req.body);
    
  await attachAudit(req, { 
            action: 'CREATE_PERMISSION', 
            entity: 'permission', 
            entityId: permission.id, 
            metadata: { query: req.body } 
        });
    return created(res, {
      id: permission.id,
      key: permission.key,
      name: permission.name,
    }, 'Permission created successfully');
  } catch (err) {
    if (err.statusCode === 409) return fail(res, err.message, 409);
    console.error('roles.createPermission', err);
    return error(res, 500, err.message || 'Unable to create permission');
  }
}
// --- ROLE & PERMISSION CRUD ---
export const getUserRoles = async (req, res) => {
    try {
        const { userId } = req.params;
        const roles = await roleService.getUserRoles(userId);
        res.status(200).json(roles);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve user roles', error: error.message });
    }
};

export const updateUserRoles = async (req, res) => {
    try {
        const { userId } = req.params;
        // Expects an array of roleKeys: { roleKeys: ["ADMIN", "NURSE"] }
        const { roleKeys } = req.body;

        if (!Array.isArray(roleKeys)) {
            return res.status(400).json({ message: 'roleKeys must be an array.' });
        }

        await roleService.updateUserRoles(userId, roleKeys);
        res.status(200).json({ message: 'User roles updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user roles', error: error.message });
    }
};

// --- NEW: User Direct Permission Assignment Controllers ---

export const getUserPermissions = async (req, res) => {
    try {
        const { userId } = req.params;
        const permissions = await roleService.getUserPermissions(userId);
        res.status(200).json(permissions);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve user direct permissions', error: error.message });
    }
};

export const updateUserPermissions = async (req, res) => {
    try {
        const { userId } = req.params;
        // Expects an array of permissionKeys: { permissions: ["PATIENT_READ", "USER_CREATE"] }
        const { permissions } = req.body; 

        if (!Array.isArray(permissions)) {
            return res.status(400).json({ message: 'permissions must be an array.' });
        }

        await roleService.updateUserPermissions(userId, permissions);
        res.status(200).json({ message: 'User direct permissions updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user direct permissions', error: error.message });
    }
};

export const attachPermissionToUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { permissionKey } = req.body;

        if (!permissionKey) {
            return res.status(400).json({ message: 'permissionKey is required.' });
        }
        
        await roleService.attachPermissionToUser(userId, permissionKey);
        res.status(201).json({ message: 'Permission attached successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to attach permission', error: error.message });
    }
};
export const attachRoleToUser = async (req, res) => {
    try {
        const { userId } = req.params;
        // Assuming the request body is { roleKey: "DOCTOR" }
        const { roleKey } = req.body; 

        if (!roleKey) {
            return res.status(400).json({ message: 'roleKey is required.' });
        }

        await roleService.attachRoleToUser(userId, roleKey);
        res.status(201).json({ message: `Role ${roleKey} attached to user ${userId} successfully.` });
    } catch (error) {
        res.status(500).json({ message: 'Failed to attach role', error: error.message });
    }
}