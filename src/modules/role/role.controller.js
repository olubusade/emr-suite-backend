import * as roleService from './role.service.js';
import { ok, created, noContent, fail, error } from '../../shared/utils/response.js'; // Added noContent
import { attachAudit } from '../../shared/middlewares/audit.middleware.js';
import { AUDIT_ACTIONS } from '../../constants/index.js';
import { logger } from '../../config/logger.js';
import ApiError from '../../shared/utils/ApiError.js';
/**
 * ROLE & PERMISSION CONTROLLER
 * Manages the global security matrix including Roles, Permissions, 
 * and their associations to Users.
 */

// --- GLOBAL LOOKUPS ---
export async function getAllRoles(req, res) {
  
    const roles = await roleService.getAllRoles();
    // Assuming roleService.getAllRoles returns an array of { id, name, key }
    return ok(res, roles, 'All roles retrieved successfully');
}

/**
 * Get all master permissions (simple list)
 */
export async function getAllPermissions(req, res) {
    
    const permissions = await roleService.getAllPermissions();
    // Assuming roleService.getAllPermissions returns an array of { id, key, name }
    return ok(res, permissions, 'Master permissions retrieved successfully');
}


// --- Role-Permission Assignment Methods ---

/**
 * Get permissions assigned to a specific role
 */
export async function getRolePermissions(req, res) {
    
    const { roleId } = req.params;
    if (!roleId) { 
        throw new ApiError(400, 'Missing role id');
    }
    const permissions = await roleService.getRolePermissions(roleId);

    // Assuming roleService.getRolePermissions returns an array of { id, key, name }
    return ok(res, permissions, `Permissions for role ${roleId} retrieved successfully`);
}

/**
 * Update permissions for a specific role (The Matrix Save button)
 */
export async function updateRolePermissions(req, res) {
    const { roleId } = req.params;
    if (!roleId) { 
        throw new ApiError(400, 'Missing role id');
    }
    const { permissionKeys } = req.body; // Array of keys, e.g., ['PATIENT_READ', 'USER_CREATE']

    await roleService.updateRolePermissions(roleId, permissionKeys);
    
    await attachAudit(req, { 
        action: AUDIT_ACTIONS.RBAC_ROLE_PERMISSIONS_UPDATE, 
        entity: 'role', 
        entityId: roleId, 
        metadata: { query: permissionKeys } 
    });
    return ok(res, null, `Permissions for role ${roleId} updated successfully`);
}

// --- ROLE & PERMISSION CRUD ---

/**
 * Create a new role (Updated endpoint to use base path)
 */
export async function createRole(req, res) {
  
    const role = await roleService.createRole(req.body);
        
        await attachAudit(req, { 
            action: AUDIT_ACTIONS.RBAC_ROLE_CREATE,
            entity: 'role', 
            entityId: role.id, 
            metadata: { query: req.body } 
        });

    return created(res, {
        id: role.id,
        name: role.name,
        key: role.key, // Ensure key is returned
    }, 'Role created successfully');
}

/**
 * Delete a role
 */
export async function deleteRole(req, res) {
    
    const { roleId } = req.params;
    if (!roleId) { 
        throw new ApiError(400, 'Missing role id');
    }
    await roleService.deleteRole(roleId);
    
    await attachAudit(req, { 
        action: AUDIT_ACTIONS.RBAC_ROLE_DELETE, 
        entity: 'role', 
        entityId: roleId, 
        metadata: { query: req.params } 
    });

    return noContent(res); // 204 No Content for successful deletion
}


// --- Permission CRUD Methods ---

/**
 * Create a new permission
 */
export async function createPermission(req, res) {
  
  const permission = await roleService.createPermission(req.body);
    
  await attachAudit(req, { 
            action: AUDIT_ACTIONS.CREATE_PERMISSION,
            entity: 'permission', 
            entityId: permission.id, 
            metadata: { query: req.body } 
        });
    return created(res, {
      id: permission.id,
      key: permission.key,
      name: permission.name,
    }, 'Permission created successfully');
}
// --- ROLE & PERMISSION CRUD ---
export const getUserRoles = async (req, res) => {
    const { userId } = req.params;
    if (!userId) { 
        return next(new Error('User ID is required'));
    }
    const roles = await roleService.getUserRoles(userId);
    res.status(200).json(roles);
    
};

export const updateUserRoles = async (req, res) => {
    
    const { userId } = req.params;
    if (!userId) { 
      throw new ApiError('User ID is required');
    }
    // Expects an array of roleKeys: { roleKeys: ["ADMIN", "NURSE"] }
    const { roleKeys } = req.body;

    if (!Array.isArray(roleKeys)) {
        return res.status(400).json({ message: 'roleKeys must be an array.' });
    }

    await roleService.updateUserRoles(userId, roleKeys);
    res.status(200).json({ message: 'User roles updated successfully.' });
    
};

// --- NEW: User Direct Permission Assignment Controllers ---

export const getUserPermissions = async (req, res) => {
    
    const { userId } = req.params;
    if (!userId) {
        throw new ApiError('User ID is required');
    }
    const permissions = await roleService.getUserPermissions(userId);
    res.status(200).json(permissions);
};

export const updateUserPermissions = async (req, res) => {
    
    const { userId } = req.params;
    if (!userId) {
        throw new ApiError('User ID is required');
        }
    // Expects an array of permissionKeys: { permissions: ["PATIENT_READ", "USER_CREATE"] }
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
        return res.status(400).json({ message: 'permissions must be an array.' });
    }

        
    const after = await roleService.updateUserPermissions(userId, permissions);
    res.status(200).json({ message: 'User direct permissions updated successfully.' });
    await attachAudit(req, { 
        action: AUDIT_ACTIONS.USER_PERMISSION_UPDATE, 
        entity: 'user', 
        entityId: userId,
        before: permissions,
        after,
        metadata: { query: permissions } 
    });
};

export const attachPermissionToUser = async (req, res) => {
    
    const { userId } = req.params;
    const { permissionKey } = req.body;

    if (!permissionKey) {
        return res.status(400).json({ message: 'permissionKey is required.' });
    }
    
    await roleService.attachPermissionToUser(userId, permissionKey);
    res.status(201).json({ message: 'Permission attached successfully.' });
};
export const attachRoleToUser = async (req, res) => {
    
    const { userId } = req.params;
    if (!userId) {
        throw new ApiError('User ID is required');
    }
    // Assuming the request body is { roleKey: "DOCTOR" }
    const { roleKey } = req.body; 

    if (!roleKey) {
        return res.status(400).json({ message: 'roleKey is required.' });
    }

    await roleService.attachRoleToUser(userId, roleKey);
    res.status(201).json({ message: `Role ${roleKey} attached to user ${userId} successfully.` });
}