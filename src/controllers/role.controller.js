import * as roleService from '../services/role.service.js';
import { ok, created, fail, error } from '../utils/response.js';
import { attachAudit } from '../middlewares/audit.middleware.js';

export async function getRoleMatrix(req, res) {
  try {
    const matrix = await roleService.getRoleMatrix();
    return ok(res, matrix, 'Role matrix retrieved');
  } catch (err) {
    console.error('roles.matrix', err);
    return error(res, err.message || 'Unable to fetch role matrix');
  }
}

export async function createRole(req, res) {
  try {
    const role = await roleService.createRole(req.body);
    await attachAudit(req, 'CREATE_ROLE', 'role', role.id, req.body);
    return created(res, role);
  } catch (err) {
    if (err.statusCode === 409) return fail(res, err.message, 409);
    console.error('roles.create', err);
    return error(res, err.message || 'Unable to create role');
  }
}

export async function createPermission(req, res) {
  try {
    const permission = await roleService.createPermission(req.body);
    await attachAudit(req, 'CREATE_PERMISSION', 'permission', permission.id, req.body);
    return created(res, permission);
  } catch (err) {
    if (err.statusCode === 409) return fail(res, err.message, 409);
    console.error('permissions.create', err);
    return error(res, err.message || 'Unable to create permission');
  }
}
