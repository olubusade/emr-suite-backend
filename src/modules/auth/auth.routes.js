import express from 'express';
import * as authController from './auth.controller.js';
import { authRequired } from '../../shared/middlewares/auth.middleware.js';
import { authorize } from '../../shared/middlewares/permission.middleware.js';
import { validate } from '../../shared/utils/validation.js';
import { loginSchema, refreshSchema, changePasswordSchema } from '../../shared/validation/index.js';
import { PERMISSIONS } from '../../constants/index.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and session management for staff users
 */

// -------------------- Public Routes -------------------- //
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user and generate tokens
 *     tags: [Auth]
 *     description: |
 *       Logs in a staff user and returns JWT access + refresh tokens.
 *       Also creates audit logs and session tracking.
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: hospitaladmin@busade-emr-demo.com
 *             password: admin@123
 *
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AuthData'
 *
 *       400:
 *         description: Validation error
 *
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validate(loginSchema),
  asyncHandler(authController.login))

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     description: Generates a new access token using a valid refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh', validate(refreshSchema), asyncHandler(authController.refresh));

// -------------------- Protected Routes -------------------- //
router.use(authRequired);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user and invalidate session
 *     tags: [Auth]
 *     description: Logs out the current user and invalidates refresh tokens
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             example:
 *               message: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', asyncHandler(authController.logout));

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Auth]
 *     description: Allows authenticated users to update their password securely
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword]
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *                 example: oldPassword123
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: newSecurePassword456
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Password updated successfully
 *       400:
 *         description: Invalid old password
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.post(
  '/change-password',
  authorize(PERMISSIONS.USER_UPDATE),
  validate(changePasswordSchema),
  asyncHandler(authController.changePassword)
);

export default router;