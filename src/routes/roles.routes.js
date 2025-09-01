import express from 'express';
import * as roleController from '../controllers/role.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/permission.middleware.js';
import { PERMISSIONS } from '../constants/index.js';

const r = express.Router();

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: API endpoints for roles and permissions
 */

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Get Role-Permission Matrix
 *     description: Retrieves a matrix of all roles and their associated permissions. Requires ROLE_READ permission.
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Role-Permission matrix retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 roles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Role'
 *                 permissions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Permission'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /api/roles/role:
 *   post:
 *     summary: Create a new role
 *     description: Creates a new role in the system. Requires ROLE_CREATE permission.
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoleCreate'
 *     responses:
 *       201:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /api/roles/permission:
 *   post:
 *     summary: Create a new permission
 *     description: Adds a new permission to the system. Requires PERMISSION_CREATE permission.
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PermissionCreate'
 *     responses:
 *       201:
 *         description: Permission created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Permission'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

r.get(
  '/',
  authRequired,
  authorize(PERMISSIONS.ROLE_READ),
  roleController.getRoleMatrix
);

r.post(
  '/role',
  authRequired,
  authorize(PERMISSIONS.ROLE_CREATE),
  roleController.createRole
);

r.post(
  '/permission',
  authRequired,
  authorize(PERMISSIONS.PERMISSION_CREATE),
  roleController.createPermission
);

export default r;
