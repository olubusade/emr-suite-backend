import express from 'express';
import * as roleController from './role.controller.js';
import { authRequired } from '../../shared/middlewares/auth.middleware.js';
import { authorize } from '../../shared/middlewares/permission.middleware.js';
import { PERMISSIONS } from '../../constants/index.js';

const r = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Roles
 *     description: Role management (RBAC core)
 *   - name: Role Permissions
 *     description: Role-permission matrix operations
 *   - name: User Roles
 *     description: Assigning roles to users
 *   - name: User Permissions
 *     description: Direct permission assignment to users (PBAC override)
 */

// ======================================================================
// ROLES
// ======================================================================

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles
 */
r.get(
  '/',
  authRequired,
  authorize(PERMISSIONS.ROLE_READ),
  roleController.getAllRoles
);

/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 */
r.post(
  '/',
  authRequired,
  authorize(PERMISSIONS.ROLE_CREATE),
  roleController.createRole
);

/**
 * @swagger
 * /roles/{roleId}:
 *   delete:
 *     summary: Delete a role
 *     tags: [Roles]
 */
r.delete(
  '/:roleId',
  authRequired,
  authorize(PERMISSIONS.ROLE_DELETE),
  roleController.deleteRole
);

// ======================================================================
// ROLE PERMISSIONS (MATRIX)
// ======================================================================

/**
 * @swagger
 * /roles/permissions/master:
 *   get:
 *     summary: Get all permissions (master list)
 *     tags: [Role Permissions]
 */
r.get(
  '/permissions/master',
  authRequired,
  authorize(PERMISSIONS.PERMISSION_READ),
  roleController.getAllPermissions
);

/**
 * @swagger
 * /roles/{roleId}/permissions:
 *   get:
 *     summary: Get permissions for a role
 *     tags: [Role Permissions]
 */
r.get(
  '/:roleId/permissions',
  authRequired,
  authorize(PERMISSIONS.PERMISSION_READ),
  roleController.getRolePermissions
);

/**
 * @swagger
 * /roles/{roleId}/permissions:
 *   put:
 *     summary: Update role permissions (matrix sync)
 *     tags: [Role Permissions]
 */
r.put(
  '/:roleId/permissions',
  authRequired,
  authorize(PERMISSIONS.PERMISSION_UPDATE),
  roleController.updateRolePermissions
);

/**
 * @swagger
 * /roles/permission:
 *   post:
 *     summary: Create a new permission
 *     tags: [Role Permissions]
 */
r.post(
  '/permission',
  authRequired,
  authorize(PERMISSIONS.PERMISSION_CREATE),
  roleController.createPermission
);

// ======================================================================
// USER ROLE MANAGEMENT
// ======================================================================

/**
 * @swagger
 * /users/{userId}/roles:
 *   get:
 *     summary: Get roles assigned to a user
 *     tags: [User Roles]
 */
r.get(
  '/users/:userId/roles',
  authRequired,
  authorize(PERMISSIONS.ROLE_READ),
  roleController.getUserRoles
);

/**
 * @swagger
 * /users/{userId}/roles:
 *   put:
 *     summary: Replace all roles for a user
 *     tags: [User Roles]
 */
r.put(
  '/users/:userId/roles',
  authRequired,
  authorize(PERMISSIONS.ROLE_UPDATE),
  roleController.updateUserRoles
);

/**
 * @swagger
 * /users/{userId}/roles:
 *   post:
 *     summary: Attach a role to a user
 *     tags: [User Roles]
 */
r.post(
  '/users/:userId/roles',
  authRequired,
  authorize(PERMISSIONS.ROLE_CREATE),
  roleController.attachRoleToUser
);

// ======================================================================
// USER PERMISSIONS (DIRECT / PBAC OVERRIDE)
// ======================================================================

/**
 * @swagger
 * /users/{userId}/permissions:
 *   get:
 *     summary: Get direct permissions of a user
 *     tags: [User Permissions]
 */
r.get(
  '/users/:userId/permissions',
  authRequired,
  authorize(PERMISSIONS.PERMISSION_READ),
  roleController.getUserPermissions
);

/**
 * @swagger
 * /users/{userId}/permissions:
 *   put:
 *     summary: Replace user direct permissions
 *     tags: [User Permissions]
 */
r.put(
  '/users/:userId/permissions',
  authRequired,
  authorize(PERMISSIONS.PERMISSION_UPDATE),
  roleController.updateUserPermissions
);

/**
 * @swagger
 * /users/{userId}/permissions:
 *   post:
 *     summary: Attach a permission to a user
 *     tags: [User Permissions]
 */
r.post(
  '/users/:userId/permissions',
  authRequired,
  authorize(PERMISSIONS.PERMISSION_CREATE),
  roleController.attachPermissionToUser
);

export default r;