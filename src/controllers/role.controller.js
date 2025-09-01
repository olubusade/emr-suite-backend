import * as roleService from '../services/role.service.js';
import { ok, created, fail, error } from '../utils/response.js';
import { attachAudit } from '../middlewares/audit.middleware.js';

/**
 * Get role-permission matrix
 */
export async function getRoleMatrix(req, res) {
  try {
    const matrix = await roleService.getRoleMatrix();

    const formattedMatrix = matrix.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions?.map(perm => ({
        id: perm.id,
        name: perm.name,
        description: perm.description,
      })) || [],
    }));

    return ok(res, formattedMatrix, 'Role matrix retrieved successfully');
  } catch (err) {
    console.error('roles.getRoleMatrix', err);
    return error(res, 500, err.message || 'Unable to fetch role matrix');
  }
}

/**
 * Create a new role
 */
export async function createRole(req, res) {
  try {
    const role = await roleService.createRole(req.body);
    await attachAudit(req, 'CREATE_ROLE', 'role', role.id, req.body);

    return created(res, {
      id: role.id,
      name: role.name,
      description: role.description,
    }, 'Role created successfully');
  } catch (err) {
    if (err.statusCode === 409) return fail(res, err.message, 409);
    console.error('roles.createRole', err);
    return error(res, 500, err.message || 'Unable to create role');
  }
}

/**
 * Create a new permission
 */
export async function createPermission(req, res) {
  try {
    const permission = await roleService.createPermission(req.body);
    await attachAudit(req, 'CREATE_PERMISSION', 'permission', permission.id, req.body);

    return created(res, {
      id: permission.id,
      name: permission.name,
      description: permission.description,
    }, 'Permission created successfully');
  } catch (err) {
    if (err.statusCode === 409) return fail(res, err.message, 409);
    console.error('roles.createPermission', err);
    return error(res, 500, err.message || 'Unable to create permission');
  }
}
