import express from 'express';
import * as userController from './user.controller.js';
import { authRequired } from '../../shared/middlewares/auth.middleware.js';
import { authorize } from '../../shared/middlewares/permission.middleware.js';
import { PERMISSIONS } from '../../constants/index.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { validate } from '../../shared/utils/validation.js';
import {
  userUpdateProfileSchema,
  userCreateSchema,
  userUpdateSchema,
  uuidParamSchema
} from '../../shared/validation/index.js';

const router = express.Router();

/**
 * =====================================================
 * AUTH GATE (ALL USER ROUTES PROTECTED)
 * =====================================================
 */
router.use(authRequired);

/**
 * =====================================================
 * SELF SERVICE (CURRENT USER)
 * =====================================================
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     description: Returns authenticated user profile
 *     tags: [Users - Self Service]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         id: { type: string }
 *                         email: { type: string }
 *                         fullName: { type: string }
 *                         role: { type: string }
 *                         active: { type: boolean }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get(
  '/me',
  asyncHandler(userController.getProfile)
);

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update current user profile
 *     description: Update logged-in user's profile
 *     tags: [Users - Self Service]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdateProfile'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         id: { type: string }
 *                         email: { type: string }
 *                         fullName: { type: string }
 *                         role: { type: string }
 *       400:
 *         description: Bad request
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.patch(
  '/me',
  validate(userUpdateProfileSchema),
  asyncHandler(userController.updateProfile)
);

/**
 * =====================================================
 * ADMIN STAFF MANAGEMENT
 * =====================================================
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: List all staff users
 *     description: Retrieve all staff users
 *     tags: [Users - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  '/',
  authorize(PERMISSIONS.USER_READ),
  asyncHandler(userController.listStaff)
);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Admin creates a new staff user
 *     tags: [Users - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreate'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         id: { type: string }
 *                         email: { type: string }
 *                         fullName: { type: string }
 *                         role: { type: string }
 *       400:
 *         description: Bad request
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post(
  '/',
  authorize(PERMISSIONS.USER_CREATE),
  validate(userCreateSchema),
  asyncHandler(userController.registerUser)
);

/**
 * =====================================================
 * ADMIN USER MANAGEMENT (BY ID)
 * =====================================================
 */

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update a user
 *     description: Update any user by ID (Admin only)
 *     tags: [Users - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch(
  '/:id',
  authorize(PERMISSIONS.USER_UPDATE),
  validate(userUpdateSchema),
  asyncHandler(userController.updateUser)
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Delete user by ID
 *     tags: [Users - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.delete(
  '/:id',
  authorize(PERMISSIONS.USER_DELETE),
  validate(uuidParamSchema),
  asyncHandler(userController.deleteUser)
);

export default router;