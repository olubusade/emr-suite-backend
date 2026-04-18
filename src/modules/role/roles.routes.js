import express from 'express';
import * as roleController from './role.controller.js';
import { authRequired } from '../../shared/middlewares/auth.middleware.js';
import { authorize } from '../../shared/middlewares/permission.middleware.js';
import { PERMISSIONS } from '../../constants/index.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

const r = express.Router();

/**
 * =========================
 * ROLE & PERMISSION MODULE
 * =========================
 ======================================================================
// ROLES
// ======================================================================
r.get('/', authRequired, authorize(PERMISSIONS.ROLE_READ), roleController.getAllRoles);
/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Retrieve all roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
r.get('/', authRequired, authorize(PERMISSIONS.ROLE_READ),
 asyncHandler(roleController.getAllRoles));

/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: biller
 *     responses:
 *       201:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
r.post('/', authRequired, authorize(PERMISSIONS.ROLE_CREATE), asyncHandler(roleController.createRole));

/**
 * @swagger
 * /roles/{roleId}:
 *   delete:
 *     summary: Delete a role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
r.delete('/:roleId', authRequired, authorize(PERMISSIONS.ROLE_DELETE), asyncHandler(roleController.deleteRole));

// ======================================================================
// ROLE PERMISSIONS
// ======================================================================

/**
 * @swagger
 * /roles/permissions/master:
 *   get:
 *     summary: Retrieve all permissions
 *     tags: [Role Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PermissionArray'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
r.get('/permissions/master', authRequired, authorize(PERMISSIONS.PERMISSION_READ), asyncHandler(roleController.getAllPermissions));

/**
 * @swagger
 * /roles/{roleId}/permissions:
 *   get:
 *     summary: Retrieve permissions for a role
 *     tags: [Role Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Role permissions retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PermissionArray'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
r.get('/:roleId/permissions', authRequired, authorize(PERMISSIONS.PERMISSION_READ), asyncHandler(roleController.getRolePermissions));

/**
 * @swagger
 * /roles/{roleId}/permissions:
 *   put:
 *     summary: Update role permissions
 *     description: Replaces all permissions assigned to a role
 *     tags: [Role Permissions]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [permissions]
 *             properties:
 *               permissions:
 *                 type: array
 *                 description: List of permission keys to assign
 *                 items:
 *                   type: string
 *                   example: PATIENT_READ
 *                 example:
 *                   - PATIENT_READ
 *                   - PATIENT_CREATE
 *                   - APPOINTMENT_READ
 *
 *     responses:
 *       200:
 *         description: Role permissions updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: string
 *
 *       400:
 *         description: Invalid request
 *
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
r.put('/:roleId/permissions', authRequired, authorize(PERMISSIONS.PERMISSION_UPDATE), asyncHandler(roleController.updateRolePermissions));

// ======================================================================
// USER ROLES
// ======================================================================

/**
 * @swagger
 * /users/{userId}/roles:
 *   get:
 *     summary: Retrieve user roles
 *     description: Returns all roles assigned to a user
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: User roles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Role'
 *
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
r.get('/users/:userId/roles', authRequired, authorize(PERMISSIONS.ROLE_READ), asyncHandler(roleController.getUserRoles));

/**
 * @swagger
 * /users/{userId}/roles:
 *   put:
 *     summary: Replace user roles
 *     description: Overwrites all roles assigned to a user
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRoles'
 *
 *     responses:
 *       200:
 *         description: Roles updated successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
r.put('/users/:userId/roles', authRequired, authorize(PERMISSIONS.ROLE_UPDATE), asyncHandler(roleController.updateUserRoles));

/**
 * @swagger
 * /users/{userId}/roles:
 *   post:
 *     summary: Attach role to user
 *     description: Adds a single role to a user
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AttachRole'
 *
 *     responses:
 *       200:
 *         description: Role attached successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
r.post('/users/:userId/roles', authRequired, authorize(PERMISSIONS.ROLE_CREATE), asyncHandler(roleController.attachRoleToUser));

// ======================================================================
// USER PERMISSIONS
// ======================================================================

/**
 * @swagger
 * /users/{userId}/permissions:
 *   get:
 *     summary: Retrieve user direct permissions
 *     tags: [User Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User permissions retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PermissionArray'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
r.get('/users/:userId/permissions', authRequired, authorize(PERMISSIONS.PERMISSION_READ), asyncHandler(roleController.getUserPermissions));

/**
 * @swagger
 * /users/{userId}/permissions:
 *   put:
 *     summary: Replace user permissions
 *     description: Overwrites all existing permissions for a user
 *     tags: [User Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserPermissions'
 *     responses:
 *       200:
 *         description: Permissions updated successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
r.put('/users/:userId/permissions', authRequired, authorize(PERMISSIONS.PERMISSION_UPDATE), asyncHandler(roleController.updateUserPermissions));

/**
 * @swagger
 * /users/{userId}/permissions:
 *   post:
 *     summary: Attach permission to user
 *     description: Adds a single permission to a user
 *     tags: [User Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AttachPermission'
 *     responses:
 *       200:
 *         description: Permission attached successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
r.post('/users/:userId/permissions', authRequired, authorize(PERMISSIONS.PERMISSION_CREATE), asyncHandler(roleController.attachPermissionToUser));

export default r;