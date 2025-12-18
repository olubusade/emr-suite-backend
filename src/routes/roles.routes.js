import express from 'express';
import * as roleController from '../controllers/role.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/permission.middleware.js';
import { PERMISSIONS } from '../constants/index.js';

const r = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Roles
 *     description: API endpoints for roles and permissions
 *   - name: User Role & Permission Management
 *     description: Assigning roles and permissions directly to users
 */

// ==========================================================================
// ROLE MANAGEMENT ROUTES (/api/roles)
// ==========================================================================

// -- List & Create Roles ---------------------------------------------------
r.get('/', authRequired, authorize(PERMISSIONS.ROLE_READ), roleController.getAllRoles);
r.post('/', authRequired, authorize(PERMISSIONS.ROLE_CREATE), roleController.createRole);

// -- Delete Role -----------------------------------------------------------
r.delete('/:roleId', authRequired, authorize(PERMISSIONS.ROLE_DELETE), roleController.deleteRole);

// -- Master Permission List ------------------------------------------------
r.get('/permissions/master', authRequired, authorize(PERMISSIONS.PERMISSION_READ), roleController.getAllPermissions);

// -- Role Permission Assignment --------------------------------------------
r.get('/:roleId/permissions', authRequired, authorize(PERMISSIONS.PERMISSION_READ), roleController.getRolePermissions);
r.put('/:roleId/permissions', authRequired, authorize(PERMISSIONS.PERMISSION_UPDATE), roleController.updateRolePermissions);

// -- Create a new Permission -----------------------------------------------
r.post('/permission', authRequired, authorize(PERMISSIONS.PERMISSION_CREATE), roleController.createPermission);

// ==========================================================================
// USER → ROLE & PERMISSION MANAGEMENT ROUTES (/api/users/...)
// ==========================================================================

/**
 * @swagger
 * /api/users/{userId}/roles:
 *   get:
 *     summary: Get all roles assigned to a user
 *     description: Fetches the list of roles currently assigned to a user. Requires ROLE_READ permission.
 *     tags: [User Role & Permission Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of roles for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RoleSimple'
 *   put:
 *     summary: Update roles assigned to a user
 *     description: Replaces all roles for a user with the provided role keys. Requires ROLE_UPDATE permission.
 *     tags: [User Role & Permission Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleKeys:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: ["DOCTOR", "NURSE"]
 *     responses:
 *       200:
 *         description: User roles updated successfully
 */
r.get('/:userId/roles', authRequired, authorize(PERMISSIONS.ROLE_READ), roleController.getUserRoles);
r.put('/users/:userId/roles', authRequired, authorize(PERMISSIONS.ROLE_UPDATE), roleController.updateUserRoles);

/**
 * @swagger
 * /api/users/{userId}/roles:
 *   post:
 *     summary: Attach a specific role to a user
 *     description: Adds a role to the specified user. Requires ROLE_CREATE permission.
 *     tags: [User Role & Permission Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleId:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       201:
 *         description: Role attached to user successfully
 */
r.post('/users/:userId/roles', authRequired, authorize(PERMISSIONS.ROLE_CREATE), roleController.attachRoleToUser);

/**
 * @swagger
 * /api/users/{userId}/permissions:
 *   get:
 *     summary: Get all direct permissions assigned to a user
 *     description: Returns permissions directly assigned to the user (not inherited from roles). Requires PERMISSION_READ.
 *     tags: [User Role & Permission Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: User permissions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *   put:
 *     summary: Update all direct permissions for a user
 *     description: Replaces all direct user permissions with a new list. Requires PERMISSION_UPDATE.
 *     tags: [User Role & Permission Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissionKeys:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: ["PATIENT_READ", "USER_CREATE"]
 *     responses:
 *       200:
 *         description: User permissions updated successfully
 */
r.get('/users/:userId/permissions', authRequired, authorize(PERMISSIONS.PERMISSION_READ), roleController.getUserPermissions);
r.put('/users/:userId/permissions', authRequired, authorize(PERMISSIONS.PERMISSION_UPDATE), roleController.updateUserPermissions);

/**
 * @swagger
 * /api/users/{userId}/permissions:
 *   post:
 *     summary: Attach a specific permission directly to a user
 *     description: Assigns a direct permission (by key) to a user. Requires PERMISSION_CREATE.
 *     tags: [User Role & Permission Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissionKey:
 *                 type: string
 *                 example: "USER_READ"
 *     responses:
 *       201:
 *         description: Permission attached to user successfully
 */
r.post('/users/:userId/permissions', authRequired, authorize(PERMISSIONS.PERMISSION_CREATE), roleController.attachPermissionToUser);

export default r;
