import express from 'express';
import * as roleController from './role.controller.js';
import { authRequired } from '../../shared/middlewares/auth.middleware.js';
import { authorize } from '../../shared/middlewares/permission.middleware.js';
import { PERMISSIONS } from '../../constants/index.js';

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
r.get('/', authRequired, authorize(PERMISSIONS.ROLE_READ), roleController.getAllRoles);

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
 *                 example: doctor
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
r.post('/', authRequired, authorize(PERMISSIONS.ROLE_CREATE), roleController.createRole);

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
r.delete('/:roleId', authRequired, authorize(PERMISSIONS.ROLE_DELETE), roleController.deleteRole);

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
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
r.get('/permissions/master', authRequired, authorize(PERMISSIONS.PERMISSION_READ), roleController.getAllPermissions);

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
 *               $ref: '#/components/schemas/ApiResponse'
 */
r.get('/:roleId/permissions', authRequired, authorize(PERMISSIONS.PERMISSION_READ), roleController.getRolePermissions);

/**
 * @swagger
 * /roles/{roleId}/permissions:
 *   put:
 *     summary: Update role permissions
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: PATIENT_READ
 *     responses:
 *       200:
 *         description: Role permissions updated
 */
r.put('/:roleId/permissions', authRequired, authorize(PERMISSIONS.PERMISSION_UPDATE), roleController.updateRolePermissions);

// ======================================================================
// USER ROLES
// ======================================================================

/**
 * @swagger
 * /users/{userId}/roles:
 *   get:
 *     summary: Retrieve user roles
 *     tags: [User Roles]
 */
r.get('/users/:userId/roles', authRequired, authorize(PERMISSIONS.ROLE_READ), roleController.getUserRoles);

/**
 * @swagger
 * /users/{userId}/roles:
 *   put:
 *     summary: Replace user roles
 *     tags: [User Roles]
 */
r.put('/users/:userId/roles', authRequired, authorize(PERMISSIONS.ROLE_UPDATE), roleController.updateUserRoles);

/**
 * @swagger
 * /users/{userId}/roles:
 *   post:
 *     summary: Attach role to user
 *     tags: [User Roles]
 */
r.post('/users/:userId/roles', authRequired, authorize(PERMISSIONS.ROLE_CREATE), roleController.attachRoleToUser);

// ======================================================================
// USER PERMISSIONS
// ======================================================================

/**
 * @swagger
 * /users/{userId}/permissions:
 *   get:
 *     summary: Retrieve user direct permissions
 *     tags: [User Permissions]
 */
r.get('/users/:userId/permissions', authRequired, authorize(PERMISSIONS.PERMISSION_READ), roleController.getUserPermissions);

/**
 * @swagger
 * /users/{userId}/permissions:
 *   put:
 *     summary: Replace user permissions
 *     tags: [User Permissions]
 */
r.put('/users/:userId/permissions', authRequired, authorize(PERMISSIONS.PERMISSION_UPDATE), roleController.updateUserPermissions);

/**
 * @swagger
 * /users/{userId}/permissions:
 *   post:
 *     summary: Attach permission to user
 *     tags: [User Permissions]
 */
r.post('/users/:userId/permissions', authRequired, authorize(PERMISSIONS.PERMISSION_CREATE), roleController.attachPermissionToUser);

export default r;